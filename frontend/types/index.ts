export interface User {
  id: string
  email: string
  role: "user" | "admin"
  name: string
}

export interface SensorData {
  id: string
  temperature: number
  humidity?: number
  timestamp: string
  deviceId: string
}

export interface DeviceStatus {
  deviceId: string
  name: string
  type: "light" | "sensor"
  status: "on" | "off"
  lastUpdate: string
}

export interface WeatherData {
  temperature: number
  humidity: number
  description: string
  icon: string
  city: string
}

export interface NotificationSettings {
  morningTime: string
  eveningTime: string
  emailNotifications: boolean
  autoControl: boolean
}

export interface HistoricalData {
  timestamp: string
  temperature: number
  humidity: number
}

export interface SimulatorData {
  temperature: number
  humidity: number
  light: number // Lux
  rain: number // mm/hr
  pm25?: number
  timestamp: string
}

export interface PlantCondition {
  name: string
  status: "excellent" | "good" | "warning" | "critical"
  temperature: { min: number; max: number; current: number }
  humidity: { min: number; max: number; current: number }
  light: { min: number; max: number; current: number }
  rain: { status: string; amount: number }
  recommendations: string[]
  alerts: string[]
}

export interface ActuatorState {
  led: "on" | "off"
  relay: "on" | "off"
  fan: number // 0-100%
  sprinkler: "on" | "off"
}

// Threshold & Notification Types
export interface SensorThreshold {
  id?: string
  deviceId: string
  sensorType: "temperature" | "humidity" | "light" | "pm25" | "rain"
  minValue?: number
  maxValue?: number
  enabled: boolean
  notifyEmail?: boolean
  notifyBrowser?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface NotificationAlert {
  id: string
  deviceId: string
  sensorType: string
  currentValue: number | null
  thresholdValue: number | null
  thresholdType?: "min" | "max" | null
  message: string
  severity: "info" | "warning" | "error" | "critical"
  timestamp: string
  read: boolean
}

export interface NotificationPreference {
  userId: string
  emailEnabled: boolean
  browserEnabled: boolean
  soundEnabled: boolean
  quietHoursStart?: string
  quietHoursEnd?: string
}
