"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  getUnreadNotifications,
  getNotificationsByDevice,
  markNotificationAsRead,
  deleteNotification,
  requestNotificationPermission
} from "@/lib/notifications"
import type { NotificationAlert } from "@/types"
import { Bell, BellOff, Check, Trash2, AlertTriangle, Info, AlertCircle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { th } from "date-fns/locale"

interface NotificationCenterProps {
  deviceId?: string
}

export default function NotificationCenter({ deviceId }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<NotificationAlert[]>([])
  const [loading, setLoading] = useState(false)
  const [browserNotificationsEnabled, setBrowserNotificationsEnabled] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    loadNotifications()
    checkBrowserNotificationPermission()

    // Refresh notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000)
    return () => clearInterval(interval)
  }, [deviceId])

  const loadNotifications = async () => {
    setLoading(true)
    try {
      const data = deviceId
        ? await getNotificationsByDevice(deviceId)
        : await getUnreadNotifications()
      
      setNotifications(data)
      setUnreadCount(data.filter(n => !n.read).length)
    } catch (error) {
      console.error("Error loading notifications:", error)
    }
    setLoading(false)
  }

  const checkBrowserNotificationPermission = () => {
    if ("Notification" in window) {
      setBrowserNotificationsEnabled(Notification.permission === "granted")
    }
  }

  const handleRequestPermission = () => {
    const granted = requestNotificationPermission()
    setBrowserNotificationsEnabled(granted)
  }

  const handleMarkAsRead = async (id: string) => {
    await markNotificationAsRead(id)
    await loadNotifications()
  }

  const handleDelete = async (id: string) => {
    await deleteNotification(id)
    await loadNotifications()
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <AlertCircle className="w-5 h-5 text-red-500" />
      case "error":
        return <AlertTriangle className="w-5 h-5 text-orange-500" />
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      default:
        return <Info className="w-5 h-5 text-blue-500" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "destructive"
      case "error":
        return "destructive"
      case "warning":
        return "default"
      default:
        return "secondary"
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              การแจ้งเตือน
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              {deviceId
                ? `การแจ้งเตือนของอุปกรณ์ ${deviceId}`
                : "การแจ้งเตือนทั้งหมดที่ยังไม่ได้อ่าน"}
            </CardDescription>
          </div>

          <div className="flex gap-2">
            {!browserNotificationsEnabled && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRequestPermission}
              >
                <Bell className="w-4 h-4 mr-2" />
                เปิดการแจ้งเตือน
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={loadNotifications}>
              รีเฟรช
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          {loading && (
            <div className="text-center py-8 text-muted-foreground">
              กำลังโหลด...
            </div>
          )}

          {!loading && notifications.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <BellOff className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>ไม่มีการแจ้งเตือน</p>
            </div>
          )}

          <div className="space-y-3">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`border-l-4 ${
                  notification.read ? "opacity-60" : ""
                } ${
                  notification.severity === "critical"
                    ? "border-l-red-500"
                    : notification.severity === "error"
                    ? "border-l-orange-500"
                    : notification.severity === "warning"
                    ? "border-l-yellow-500"
                    : "border-l-blue-500"
                }`}
              >
                <CardContent className="pt-4">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getSeverityIcon(notification.severity)}
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant={getSeverityColor(notification.severity) as any}>
                              {notification.severity.toUpperCase()}
                            </Badge>
                            <Badge variant="outline">
                              {notification.deviceId}
                            </Badge>
                            {!notification.read && (
                              <Badge variant="default" className="bg-blue-500">
                                ใหม่
                              </Badge>
                            )}
                          </div>

                          <p className="text-sm font-medium leading-relaxed">
                            {notification.message}
                          </p>

                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>
                              {formatDistanceToNow(new Date(notification.timestamp), {
                                addSuffix: true,
                                locale: th,
                              })}
                            </span>
                            {notification.currentValue !== null && (
                              <span>
                                ค่าปัจจุบัน: <strong>{notification.currentValue}</strong>
                              </span>
                            )}
                            {notification.thresholdValue !== null && (
                              <span>
                                ขีดจำกัด: <strong>{notification.thresholdValue}</strong>
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-1">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkAsRead(notification.id)}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(notification.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
