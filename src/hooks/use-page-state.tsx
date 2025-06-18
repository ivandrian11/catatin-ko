import { useEffect, useState } from 'react'

export const usePageState = () => {
  const [isHydrated, setIsHydrated] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  return { isHydrated, isDeleting, setIsDeleting }
}
