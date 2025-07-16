"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, XCircle, Clock, RefreshCw, AlertTriangle } from "lucide-react"
import { useRealTimeDataContext } from "@/contexts/real-time-data-context"

export function DataStatusIndicator() {
  const { dataSourceStatus, lastUpdate, loading, error, refresh } = useRealTimeDataContext()

  const getStatusIcon = (status: any) => {
    if (!status) return <XCircle className="h-4 w-4 text-destructive" />

    if (status.errorCount > 0) {
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    }

    if (status.isStale) {
      return <Clock className="h-4 w-4 text-muted-foreground" />
    }

    return <CheckCircle className="h-4 w-4 text-green-500" />
  }

  const getStatusText = (status: any) => {
    if (!status) return "Offline"
    if (status.errorCount > 0) return "Issues"
    if (status.isStale) return "Stale"
    return "Online"
  }

  const getStatusColor = (status: any) => {
    if (!status) return "destructive"
    if (status.errorCount > 0) return "secondary"
    if (status.isStale) return "outline"
    return "default"
  }

  const formatLastUpdate = (timestamp: number | null) => {
    if (!timestamp) return "Never"
    const date = new Date(timestamp)
    return date.toLocaleTimeString()
  }

  const sources = Object.entries(dataSourceStatus || {})
  const onlineCount = sources.filter(([_, status]) => status && status.errorCount === 0 && !status.isStale).length
  const totalCount = sources.length

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 px-2">
          <div className="flex items-center gap-2">
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : error ? (
              <XCircle className="h-4 w-4 text-destructive" />
            ) : (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
            <span className="text-sm">{loading ? "Updating..." : `${onlineCount}/${totalCount} Online`}</span>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm">Data Sources</CardTitle>
                <CardDescription>
                  {lastUpdate ? `Last updated: ${lastUpdate.toLocaleTimeString()}` : "No updates yet"}
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => refresh()} disabled={loading}>
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {error && (
              <>
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <XCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
                <Separator />
              </>
            )}

            {sources.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-4">No data sources configured</div>
            ) : (
              <div className="space-y-2">
                {sources.map(([sourceId, status]) => (
                  <div key={sourceId} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(status)}
                      <span className="text-sm font-medium">{status?.name || sourceId}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{status?.cachedItems || 0} items</span>
                      <Badge variant={getStatusColor(status) as any} className="text-xs">
                        {getStatusText(status)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Separator />

            <div className="text-xs text-muted-foreground space-y-1">
              <div>Total Sources: {totalCount}</div>
              <div>Online: {onlineCount}</div>
              <div>Issues: {sources.filter(([_, status]) => status?.errorCount > 0).length}</div>
            </div>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  )
}
