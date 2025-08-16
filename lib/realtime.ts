"use client"

type Callback = () => void

let subscribers: Callback[] = []

export function subscribePublished(callback: Callback) {
  subscribers.push(callback)

  return () => {
    subscribers = subscribers.filter((cb) => cb !== callback)
  }
}

export function notifyPublished() {
  subscribers.forEach((callback) => callback())
}

// Simulate real-time updates for demo purposes
if (typeof window !== "undefined") {
  // Listen for storage changes to simulate real-time updates
  window.addEventListener("storage", (e) => {
    if (e.key === "kyctrust-cms-published") {
      notifyPublished()
    }
  })
}

export function publishContent() {
  if (typeof window !== "undefined") {
    localStorage.setItem("kyctrust-cms-published", Date.now().toString())
    notifyPublished()
  }
}
