"use client"

import { useState, useEffect, useCallback } from "react"
import { RealTimeDataService } from "@/lib/services/real-time-data-service"

interface UseRealTimeDataOptions {
  category: string
  autoRefresh?: boolean
  refreshInterval?: number
}

interface UseRealTimeDataReturn {
  data: any[]
  loading: boolean
  error: string | null
  lastUpdate: Date | null
  refresh: () => Promise<void>
  dataSourceStatus: Record<string, any>
}

export function useRealTimeData({
  category,
  autoRefresh = true,
  refreshInterval = 5 * 60 * 1000,
}: UseRealTimeDataOptions): UseRealTimeDataReturn {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [dataSourceStatus, setDataSourceStatus] = useState<Record<string, any>>({})

  const dataService = RealTimeDataService.getInstance()

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      await dataService.forceRefresh(category as any)
      const freshData = dataService.getCachedData(category as any)
      setData(Array.isArray(freshData) ? freshData : [])
      setLastUpdate(new Date())
      setDataSourceStatus(dataService.getDataSourceStatus())
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data")
      console.error(`Error refreshing ${category}:`, err)
      setData([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }, [category, dataService])

  // Initial data load
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Try to get cached data first
        const cachedData = dataService.getCachedData(category as any)
        if (Array.isArray(cachedData) && cachedData.length > 0) {
          setData(cachedData)
          setLastUpdate(new Date())
          setLoading(false)
        } else {
          // If no cached data, fetch fresh data
          await refresh()
        }
        setDataSourceStatus(dataService.getDataSourceStatus())
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load initial data")
        setData([])
        setLoading(false)
      }
    }

    loadInitialData()
  }, [category, refresh, dataService])

  // Set up subscription for real-time updates
  useEffect(() => {
    const unsubscribe = dataService.subscribe(category as any, (newData) => {
      setData(Array.isArray(newData) ? newData : [])
      setLastUpdate(new Date())
      setDataSourceStatus(dataService.getDataSourceStatus())
      setLoading(false)
    })

    return unsubscribe
  }, [category, dataService])

  // Auto-refresh interval
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      if (!loading) {
        refresh()
      }
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, loading, refresh])

  return {
    data,
    loading,
    error,
    lastUpdate,
    refresh,
    dataSourceStatus,
  }
}
