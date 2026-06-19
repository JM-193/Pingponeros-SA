import { useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export function useDelayedNavigate() {
  const navigate = useNavigate()
  const timeoutRef = useRef(null)

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current)
  }, [])

  return (path, delay) => {
    timeoutRef.current = setTimeout(() => navigate(path), delay)
  }
}
