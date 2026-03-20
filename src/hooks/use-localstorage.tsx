import { useState, useEffect, useCallback } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
  const readValue = useCallback((): T => {
    if (typeof window === 'undefined') return initialValue
    try {
      const item = window.localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : initialValue
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  }, [initialValue, key])

  const [storedValue, setStoredValue] = useState<T>(readValue)

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)

      if (typeof window !== 'undefined') {
        const stringifiedValue = JSON.stringify(valueToStore)
        window.localStorage.setItem(key, stringifiedValue)

        window.dispatchEvent(
          new CustomEvent('local-storage-sync', {
            detail: { key, newValue: stringifiedValue },
          }),
        )
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error)
    }
  }

  const onRefresh = useCallback(() => {
    setStoredValue(readValue())
  }, [readValue])

  useEffect(() => {
    // 1. Lắng nghe thay đổi từ các TAB KHÁC
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key) {
        try {
          setStoredValue(
            event.newValue ? JSON.parse(event.newValue) : initialValue,
          )
        } catch (error) {
          console.warn(`Error parsing storage event:`, error)
        }
      }
    }

    // 2. Lắng nghe thay đổi từ CÙNG TAB
    const handleCustomSync = (event: CustomEvent) => {
      if (event.detail.key === key) {
        try {
          setStoredValue(
            event.detail.newValue
              ? JSON.parse(event.detail.newValue)
              : initialValue,
          )
        } catch (error) {
          console.warn(`Error parsing custom event:`, error)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener(
      'local-storage-sync',
      handleCustomSync as EventListener,
    )

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener(
        'local-storage-sync',
        handleCustomSync as EventListener,
      )
    }
  }, [key, initialValue])

  return [storedValue, setValue, onRefresh] as const
}
