import { useCallback, useEffect, useState } from 'react'

export const useLocalStorage = <T,>(key: string, defaultValue: T) => {
  const [value, setValue] = useState<T>(defaultValue)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(key)
      if (stored) setValue(JSON.parse(stored))
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error)
    }
  }, [key])

  const setStoredValue = useCallback(
    (newValue: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const valueToStore =
          typeof newValue === 'function'
            ? (newValue as (prev: T) => T)(prev)
            : newValue

        try {
          localStorage.setItem(key, JSON.stringify(valueToStore))
        } catch (error) {
          console.error(`Error saving ${key} to localStorage:`, error)
        }

        return valueToStore
      })
    },
    [key]
  )

  return [value, setStoredValue] as const
}
