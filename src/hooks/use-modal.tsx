import { useState, useCallback } from 'react'

export const useModal = <T = unknown,>() => {
  const [isOpen, setIsOpen] = useState(false)
  const [data, setData] = useState<T | undefined>(undefined)

  const open = useCallback((modalData?: T) => {
    setData(modalData)
    setIsOpen(true)
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
    setData(undefined)
  }, [])

  return {
    isOpen,
    data,
    open,
    close,
  }
}
