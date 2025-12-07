import { useState, useEffect, useRef } from 'react'

const WS_URL = import.meta.env.VITE_API_WS_URL || 'wss://nahuelviera.dev/ws/stats'

export function useWebSocketStats() {
  const [stats, setStats] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState(null)
  const wsRef = useRef(null)
  const reconnectTimeoutRef = useRef(null)
  const reconnectAttemptsRef = useRef(0)

  useEffect(() => {
    let ws = null

    function connect() {
      try {
        ws = new WebSocket(WS_URL)
        wsRef.current = ws

        ws.onopen = () => {
          console.log('WebSocket connected')
          setIsConnected(true)
          setError(null)
          reconnectAttemptsRef.current = 0
        }

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            if (data.type === 'stats') {
              setStats(data)
            }
          } catch (err) {
            console.error('Error parsing WebSocket message:', err)
          }
        }

        ws.onerror = (err) => {
          console.error('WebSocket error:', err)
          setError('Connection error')
        }

        ws.onclose = () => {
          console.log('WebSocket closed')
          setIsConnected(false)
          wsRef.current = null

          // Exponential backoff reconnect (max 30s)
          const backoffDelay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000)
          reconnectAttemptsRef.current += 1

          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`Reconnecting WebSocket (attempt ${reconnectAttemptsRef.current})...`)
            connect()
          }, backoffDelay)
        }
      } catch (err) {
        console.error('Error creating WebSocket:', err)
        setError('Failed to connect')
      }
    }

    connect()

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [])

  return {
    stats,
    isConnected,
    error,
    storage: stats?.storage || null,
    queue: stats?.queue || null,
    recentItems: stats?.recentItems || [],
  }
}
