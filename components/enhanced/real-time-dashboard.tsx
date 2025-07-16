"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Activity, TrendingUp, RefreshCw, AlertCircle, CheckCircle, Clock, Database, Wifi, WifiOff } from "lucide-react"
import { useRealTimeDataContext } from "@/contexts/real-time-data-context"

interface MetricData {
  label: string
  value: string | number
  change: string
  trend: "up" | "down" | "stable"
  color: string
}

export function RealTimeDashboard() {
  const [isOnline, setIsOnline] = useState(true)
  const [lastPulse, setLastPulse] = useState(Date.now())
  const { repositories, models, news, companies, tools, loading, error, lastUpdate, refresh, dataSourceStatus } =
    useRealTimeDataContext()

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    if (typeof window !== "undefined") {
      window.addEventListener("online", handleOnline)
      window.addEventListener("offline", handleOffline)
      setIsOnline(navigator.onLine)

      return () => {
        window.removeEventListener("online", handleOnline)
        window.removeEventListener("offline", handleOffline)
      }
    }
  }, [])

  // Pulse animation
  useEffect(() => {
    const interval = setInterval(() => {
      setLastPulse(Date.now())
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  // Safe data access
  const safeRepositories = Array.isArray(repositories) ? repositories : []
  const safeModels = Array.isArray(models) ? models : []
  const safeNews = Array.isArray(news) ? news : []
  const safeCompanies = Array.isArray(companies) ? companies : []
  const safeTools = Array.isArray(tools) ? tools : []

  const calculateMetrics = (): MetricData[] => {
    const totalItems = safeRepositories.length + safeModels.length + safeNews.length
    const totalStars = safeRepositories.reduce((sum, repo) => sum + (repo?.stargazers_count || 0), 0)
    const totalDownloads = safeModels.reduce((sum, model) => sum + (model?.downloads || 0), 0)
    const recentNews = safeNews.filter((article) => {
      if (!article?.publishedAt) return false
      const articleDate = new Date(article.publishedAt)
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
      return articleDate > oneDayAgo
    }).length

    return [
      {
        label: "Total Items",
        value: totalItems.toLocaleString(),
        change: "+12%",
        trend: "up",
        color: "text-green-400",
      },
      {
        label: "GitHub Stars",
        value: totalStars > 1000000 ? `${(totalStars / 1000000).toFixed(1)}M` : totalStars.toLocaleString(),
        change: "+8%",
        trend: "up",
        color: "text-yellow-400",
      },
      {
        label: "Model Downloads",
        value: totalDownloads > 1000000 ? `${(totalDownloads / 1000000).toFixed(1)}M` : totalDownloads.toLocaleString(),
        change: "+23%",
        trend: "up",
        color: "text-blue-400",
      },
      {
        label: "News Today",
        value: recentNews,
        change: "+5%",
        trend: "up",
        color: "text-purple-400",
      },
      {
        label: "AI Companies",
        value: safeCompanies.length,
        change: "+2%",
        trend: "stable",
        color: "text-cyan-400",
      },
      {
        label: "AI Tools",
        value: safeTools.length,
        change: "+15%",
        trend: "up",
        color: "text-orange-400",
      },
    ]
  }

  const metrics = calculateMetrics()
  const healthScore = isOnline && !error ? 95 : error ? 60 : 30
  const activeDataSources = dataSourceStatus ? Object.keys(dataSourceStatus).length : 0
  const healthyDataSources = dataSourceStatus
    ? Object.values(dataSourceStatus).filter((status: any) => status && !status.isStale && status.errorCount === 0)
        .length
    : 0

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 text-white">
            <div className="relative">
              <Activity className="w-5 h-5 text-cyan-400" />
              <div
                className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
                  isOnline ? "bg-green-400" : "bg-red-400"
                } animate-pulse`}
                style={{
                  animationDuration: "2s",
                }}
              />
            </div>
            <span>⚡ Real-Time AI Pulse</span>
            <Badge
              variant="secondary"
              className={`${
                isOnline
                  ? "bg-green-500/20 text-green-400 border-green-500/30"
                  : "bg-red-500/20 text-red-400 border-red-500/30"
              }`}
            >
              {isOnline ? "Live" : "Offline"}
            </Badge>
          </CardTitle>

          <div className="flex items-center space-x-2">
            {isOnline ? <Wifi className="w-4 h-4 text-green-400" /> : <WifiOff className="w-4 h-4 text-red-400" />}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refresh()}
              disabled={loading}
              className="text-gray-400 hover:text-white"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* System Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${healthScore > 80 ? "bg-green-500/20" : "bg-yellow-500/20"}`}>
              {healthScore > 80 ? (
                <CheckCircle className="w-4 h-4 text-green-400" />
              ) : (
                <AlertCircle className="w-4 h-4 text-yellow-400" />
              )}
            </div>
            <div>
              <div className="text-sm font-medium text-white">System Health</div>
              <div className="text-xs text-gray-400">{healthScore}% Operational</div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-full bg-blue-500/20">
              <Database className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <div className="text-sm font-medium text-white">Data Sources</div>
              <div className="text-xs text-gray-400">
                {healthyDataSources}/{activeDataSources} Active
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-full bg-purple-500/20">
              <Clock className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <div className="text-sm font-medium text-white">Last Update</div>
              <div className="text-xs text-gray-400">{lastUpdate ? lastUpdate.toLocaleTimeString() : "Never"}</div>
            </div>
          </div>
        </div>

        {/* Health Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Overall System Health</span>
            <span className={healthScore > 80 ? "text-green-400" : "text-yellow-400"}>{healthScore}%</span>
          </div>
          <Progress value={healthScore} className="h-2" />
        </div>

        {/* Real-time Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {metrics.map((metric, index) => (
            <div key={index} className="text-center p-3 bg-gray-750 rounded-lg">
              <div className={`text-lg font-bold ${metric.color}`}>{metric.value}</div>
              <div className="text-xs text-gray-400 mb-1">{metric.label}</div>
              <div className="flex items-center justify-center space-x-1">
                <TrendingUp className={`w-3 h-3 ${metric.color}`} />
                <span className={`text-xs ${metric.color}`}>{metric.change}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="flex items-center space-x-2 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>System Alert: {error}</span>
            </div>
          </div>
        )}

        {/* Live Activity Indicator */}
        <div className="flex items-center justify-center space-x-2 text-xs text-gray-400">
          <div className="flex space-x-1">
            <div className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: "0ms" }} />
            <div className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: "200ms" }} />
            <div className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: "400ms" }} />
          </div>
          <span>Live data streaming...</span>
        </div>
      </CardContent>
    </Card>
  )
}
