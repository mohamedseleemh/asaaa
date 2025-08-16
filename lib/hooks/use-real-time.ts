"use client"

import { useEffect, useState } from "react"

interface UseRealTimeOptions {
  endpoint: string
  interval?: number
  enabled?: boolean
}

export function useRealTime<T>(options: UseRealTimeOptions) {
  const { endpoint, interval = 5000, enabled = true } = options
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled) return

    const fetchData = async () => {
      try {
        const response = await fetch(endpoint)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const result = await response.json()
        setData(result)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setLoading(false)
      }
    }

    // Initial fetch
    fetchData()

    // Set up interval
    const intervalId = setInterval(fetchData, interval)

    return () => clearInterval(intervalId)
  }, [endpoint, interval, enabled])

  return { data, loading, error }
}
