import type { SensorThreshold, NotificationAlert } from "@/types"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export async function sendEmailNotification(to: string, subject: string, message: string) {
  try {
    const response = await fetch(`${API_URL}/api/notifications/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, subject, message }),
    })

    return response.ok
  } catch (error) {
    console.error("Email notification error:", error)
    return false
  }
}

export function checkTimeForLightControl() {
  const now = new Date()
  const hour = now.getHours()

  // เช้า (6:00-8:00) - ควรปิดไฟ
  if (hour >= 6 && hour < 8) {
    return { shouldChange: true, action: "off", reason: "เวลาเช้า" }
  }

  // มืด (18:00-20:00) - ควรเปิดไฟ
  if (hour >= 18 && hour < 20) {
    return { shouldChange: true, action: "on", reason: "เวลามืด" }
  }

  return { shouldChange: false, action: null, reason: null }
}

// ==================== THRESHOLD API ====================

export async function createThreshold(threshold: Omit<SensorThreshold, "id" | "createdAt" | "updatedAt">) {
  try {
    const response = await fetch(`${API_URL}/api/thresholds`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(threshold),
    })
    const data = await response.json()
    return data.success ? data.data : null
  } catch (error) {
    console.error("Error creating threshold:", error)
    return null
  }
}

export async function getThresholdsByDevice(deviceId: string): Promise<SensorThreshold[]> {
  try {
    const response = await fetch(`${API_URL}/api/thresholds/device/${deviceId}`)
    const data = await response.json()
    return data.success ? data.data : []
  } catch (error) {
    console.error("Error fetching thresholds:", error)
    return []
  }
}

export async function updateThreshold(id: string, updates: Partial<SensorThreshold>) {
  try {
    const response = await fetch(`${API_URL}/api/thresholds/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    })
    const data = await response.json()
    return data.success ? data.data : null
  } catch (error) {
    console.error("Error updating threshold:", error)
    return null
  }
}

export async function deleteThreshold(id: string) {
  try {
    const response = await fetch(`${API_URL}/api/thresholds/${id}`, {
      method: "DELETE",
    })
    const data = await response.json()
    return data.success
  } catch (error) {
    console.error("Error deleting threshold:", error)
    return false
  }
}

// ==================== NOTIFICATION API ====================

export async function getNotificationsByDevice(deviceId: string, limit = 50): Promise<NotificationAlert[]> {
  try {
    const response = await fetch(`${API_URL}/api/alerts/device/${deviceId}?limit=${limit}`)
    const data = await response.json()
    return data.success ? data.data : []
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return []
  }
}

export async function getUnreadNotifications(): Promise<NotificationAlert[]> {
  try {
    const response = await fetch(`${API_URL}/api/alerts/unread`)
    const data = await response.json()
    return data.success ? data.data : []
  } catch (error) {
    console.error("Error fetching unread notifications:", error)
    return []
  }
}

export async function markNotificationAsRead(id: string) {
  try {
    const response = await fetch(`${API_URL}/api/alerts/${id}/read`, {
      method: "PUT",
    })
    const data = await response.json()
    return data.success
  } catch (error) {
    console.error("Error marking notification as read:", error)
    return false
  }
}

export async function deleteNotification(id: string) {
  try {
    const response = await fetch(`${API_URL}/api/alerts/${id}`, {
      method: "DELETE",
    })
    const data = await response.json()
    return data.success
  } catch (error) {
    console.error("Error deleting notification:", error)
    return false
  }
}

// ==================== BROWSER NOTIFICATION ====================

export function requestNotificationPermission() {
  if (!("Notification" in window)) {
    console.log("This browser does not support notifications")
    return false
  }

  if (Notification.permission === "granted") {
    return true
  }

  if (Notification.permission !== "denied") {
    Notification.requestPermission().then((permission) => {
      return permission === "granted"
    })
  }

  return false
}

export function showBrowserNotification(title: string, options?: NotificationOptions) {
  if (Notification.permission === "granted") {
    new Notification(title, {
      icon: "/icon-192x192.png",
      badge: "/icon-192x192.png",
      ...options,
    })
  }
}

export function showThresholdAlert(alert: NotificationAlert) {
  const title = `⚠️ แจ้งเตือนค่าเซ็นเซอร์เกินขีดจำกัด`
  const options: NotificationOptions = {
    body: alert.message,
    icon: "/icon-192x192.png",
    badge: "/icon-192x192.png",
    tag: alert.id,
    requireInteraction: alert.severity === "critical" || alert.severity === "error",
    vibrate: alert.severity === "critical" ? [200, 100, 200] : [200],
  }

  showBrowserNotification(title, options)
}
