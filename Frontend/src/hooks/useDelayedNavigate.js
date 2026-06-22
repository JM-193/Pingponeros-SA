import { useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

export function useDelayedNavigate() {
  const navigate = useNavigate()
  const timeoutRef = useRef(null)

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current)
  }, [])

  return useCallback((path, delay) => {
    timeoutRef.current = setTimeout(() => navigate(path), delay)
  }, [navigate])
}
