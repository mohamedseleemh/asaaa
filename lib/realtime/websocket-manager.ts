"use client"

type EventCallback = (data: any) => void
type EventType = "notification" | "user_activity" | "system_alert" | "content_update"

interface WebSocketMessage {
  type: EventType
  data: any
  timestamp: number
}

class WebSocketManager {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private listeners: Map<EventType, EventCallback[]> = new Map()
  private isConnecting = false

  constructor() {
    if (typeof window !== "undefined") {
      this.connect()
    }
  }

  private connect() {
    if (this.isConnecting || this.ws?.readyState === WebSocket.OPEN) {
      return
    }

    this.isConnecting = true

    try {
      // In production, use actual WebSocket URL
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3001/ws"
      this.ws = new WebSocket(wsUrl)

      this.ws.onopen = () => {
        console.log("WebSocket connected")
        this.isConnecting = false
        this.reconnectAttempts = 0
        this.emit("connection", { status: "connected" })
      }

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          this.handleMessage(message)
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error)
        }
      }

      this.ws.onclose = () => {
        console.log("WebSocket disconnected")
        this.isConnecting = false
        this.ws = null
        this.scheduleReconnect()
      }

      this.ws.onerror = (error) => {
        console.error("WebSocket error:", error)
        this.isConnecting = false
        this.fallbackToPolling()
      }
    } catch (error) {
      console.error("Failed to create WebSocket:", error)
      this.isConnecting = false
      this.fallbackToPolling()
    }
  }

  private fallbackToPolling() {
    console.log("Falling back to polling for real-time updates")

    // Poll for notifications every 30 seconds
    setInterval(async () => {
      try {
        const response = await fetch("/api/realtime/poll")
        if (response.ok) {
          const updates = await response.json()
          updates.forEach((update: WebSocketMessage) => {
            this.handleMessage(update)
          })
        }
      } catch (error) {
        console.error("Polling error:", error)
      }
    }, 30000)
  }

  private handleMessage(message: WebSocketMessage) {
    const callbacks = this.listeners.get(message.type) || []
    callbacks.forEach((callback) => {
      try {
        callback(message.data)
      } catch (error) {
        console.error("Error in WebSocket callback:", error)
      }
    })

    // Store in localStorage for cross-tab communication
    if (message.type === "notification") {
      localStorage.setItem("new_notification", JSON.stringify(message.data))
    }
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log("Max reconnection attempts reached, falling back to polling")
      this.fallbackToPolling()
      return
    }

    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts)
    this.reconnectAttempts++

    setTimeout(() => {
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
      this.connect()
    }, delay)
  }

  public on(eventType: EventType, callback: EventCallback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, [])
    }
    this.listeners.get(eventType)!.push(callback)

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(eventType) || []
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  private emit(eventType: EventType, data: any) {
    const callbacks = this.listeners.get(eventType) || []
    callbacks.forEach((callback) => callback(data))
  }

  public send(type: EventType, data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage = {
        type,
        data,
        timestamp: Date.now(),
      }
      this.ws.send(JSON.stringify(message))
    } else {
      console.warn("WebSocket not connected, message not sent:", { type, data })
    }
  }

  public isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }

  public disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.listeners.clear()
  }
}

// Singleton instance
export const wsManager = new WebSocketManager()
