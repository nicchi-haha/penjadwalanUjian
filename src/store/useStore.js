import { useState, useEffect, useCallback, useMemo } from 'react'
import { demoCourses, demoStudents, defaultSlots, getEnrollmentsFromStudents } from '@/utils/demoData'
const STORAGE_PREFIX = 'examly:'
const CHANGE_EVENT = 'examly:storage_change'
function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key)
    if (raw === null) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}
function saveToStorage(key, value) {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value))
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: { key } }))
    }
  } catch {
  }
}
export default function useStore() {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const onStorageChange = () => setTick((t) => t + 1)
    if (typeof window !== 'undefined') {
      window.addEventListener(CHANGE_EVENT, onStorageChange)
      window.addEventListener('storage', onStorageChange)
      return () => {
        window.removeEventListener(CHANGE_EVENT, onStorageChange)
        window.removeEventListener('storage', onStorageChange)
      }
    }
  }, [])
  const get = useCallback((key, fallback = null) => {
    return loadFromStorage(key, fallback)
  }, [])
  const set = useCallback((key, value) => {
    saveToStorage(key, value)
    setTick((t) => t + 1)
  }, [])
  const courses = useMemo(() => {
    return loadFromStorage('courses', demoCourses)
  }, [tick])
  const students = useMemo(() => {
    return loadFromStorage('students', demoStudents)
  }, [tick])
  const slots = useMemo(() => {
    return loadFromStorage('slots', defaultSlots)
  }, [tick])
  const enrollments = useMemo(() => {
    return getEnrollmentsFromStudents(students)
  }, [students])
  const setCourses = useCallback((newCourses) => {
    saveToStorage('courses', newCourses)
    setTick((t) => t + 1)
  }, [])
  const setStudents = useCallback((newStudents) => {
    saveToStorage('students', newStudents)
    setTick((t) => t + 1)
  }, [])
  const setSlots = useCallback((newSlots) => {
    saveToStorage('slots', newSlots)
    setTick((t) => t + 1)
  }, [])
  const resetToDemo = useCallback(() => {
    saveToStorage('courses', demoCourses)
    saveToStorage('students', demoStudents)
    saveToStorage('slots', defaultSlots)
    setTick((t) => t + 1)
  }, [])
  const clearAll = useCallback(() => {
    saveToStorage('courses', [])
    saveToStorage('students', [])
    setTick((t) => t + 1)
  }, [])
  return useMemo(
    () => ({
      get,
      set,
      courses,
      students,
      slots,
      enrollments,
      setCourses,
      setStudents,
      setSlots,
      resetToDemo,
      clearAll,
    }),
    [get, set, courses, students, slots, enrollments, setCourses, setStudents, setSlots, resetToDemo, clearAll],
  )
}
