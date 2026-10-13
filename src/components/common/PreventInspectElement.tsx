'use client'
import { useEffect, ReactNode } from 'react'

interface InspectElementProps {
  children: ReactNode
}

const InspectElement = ({ children }: InspectElementProps) => {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_INSPECT_ELEMENT === "true") {
      const handleContextMenu = (e: MouseEvent) => {
        e.preventDefault()
      }

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.keyCode === 123) {
          e.preventDefault()
        }
        if (e.ctrlKey && e.shiftKey && e.keyCode === 'I'.charCodeAt(0)) {
          e.preventDefault()
        }
        if (e.ctrlKey && e.shiftKey && e.keyCode === 'C'.charCodeAt(0)) {
          e.preventDefault()
        }
        if (e.ctrlKey && e.shiftKey && e.keyCode === 'J'.charCodeAt(0)) {
          e.preventDefault()
        }
        if (e.ctrlKey && e.keyCode === 'U'.charCodeAt(0)) {
          e.preventDefault()
        }
      }

      document.addEventListener('contextmenu', handleContextMenu)
      document.addEventListener('keydown', handleKeyDown)

      return () => {
        document.removeEventListener('contextmenu', handleContextMenu)
        document.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [])

  return children
}

export default InspectElement