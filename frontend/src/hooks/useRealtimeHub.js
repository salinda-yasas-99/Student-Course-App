import { useEffect, useRef, useState } from 'react'
import { createRealtimeConnection } from '../services/realtime'

export const useRealtimeHub = ({ hubUrl, handlers = {}, enabled = true }) => {
  const [connectionStatus, setConnectionStatus] = useState('disconnected')
  const [connectionError, setConnectionError] = useState('')
  const handlersRef = useRef(handlers)

  useEffect(() => {
    handlersRef.current = handlers
  }, [handlers])

  useEffect(() => {
    if (!enabled || !hubUrl) {
      return undefined
    }

    let isMounted = true
    const connection = createRealtimeConnection(hubUrl)
    const registeredHandlers = new Map()

    Object.keys(handlersRef.current).forEach((eventName) => {
      const wrapper = (...args) => {
        const handler = handlersRef.current[eventName]

        if (typeof handler === 'function') {
          handler(...args)
        }
      }

      registeredHandlers.set(eventName, wrapper)
      connection.on(eventName, wrapper)
    })

    connection.onreconnecting((reconnectError) => {
      if (!isMounted) {
        return
      }

      setConnectionStatus('reconnecting')

      if (reconnectError) {
        setConnectionError(reconnectError.message)
      }
    })

    connection.onreconnected(() => {
      if (!isMounted) {
        return
      }

      setConnectionStatus('connected')
      setConnectionError('')
    })

    connection.onclose((closeError) => {
      if (!isMounted) {
        return
      }

      setConnectionStatus('disconnected')

      if (closeError) {
        setConnectionError(closeError.message)
      }
    })

    void connection
      .start()
      .then(() => {
        if (isMounted) {
          setConnectionStatus('connected')
          setConnectionError('')
        }
      })
      .catch((startError) => {
        if (isMounted) {
          setConnectionStatus('error')
          setConnectionError(startError.message || 'Unable to connect to the realtime hub.')
        }
      })

    return () => {
      isMounted = false

      registeredHandlers.forEach((wrapper, eventName) => {
        connection.off(eventName, wrapper)
      })

      void connection.stop()
    }
  }, [enabled, hubUrl])

  return {
    connectionError,
    connectionStatus,
    isConnected: connectionStatus === 'connected',
  }
}