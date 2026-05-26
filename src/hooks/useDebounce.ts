import { useEffect, useRef } from 'react'

/**
 * Debounce hook — trả về phiên bản debounced của callback
 * Dùng cho: typing indicator emit, search input
 */
export function useDebounce<T extends (...args: Parameters<T>) => void>(
  callback: T,
  delay: number
) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const debouncedFn = (...args: Parameters<T>) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      callback(...args)
    }, delay)
  }

  return debouncedFn
}

/**
 * Debounce value hook — trả về giá trị debounced (cho input search)
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = [
    useRef(value).current,
    (v: T) => { useRef(v) },
  ]

  useEffect(() => {
    const timer = setTimeout(() => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}
