import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr'
import { API_BASE_URL } from './http'

const SIGNALR_HUB_URL = import.meta.env.VITE_SIGNALR_HUB_URL?.trim()

export const getRealtimeHubUrl = (hubPath = '/notificationHub') =>
  SIGNALR_HUB_URL ?? `${API_BASE_URL}${hubPath}`

export const createRealtimeConnection = (hubUrl) =>
  new HubConnectionBuilder()
    .withUrl(hubUrl)
    .withAutomaticReconnect()
    .configureLogging(LogLevel.Information)
    .build()