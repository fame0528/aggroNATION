"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { X, Zap } from "lucide-react"

interface LiveUpdateBannerProps {
  onDismiss: () => void
}

export function LiveUpdateBanner({ onDismiss }: LiveUpdateBannerProps) {
  const [isVisible, setIsVisible] = useState(true)

  const handleDismiss = () => {
    setIsVisible(false)
    setTimeout(onDismiss, 300) // Wait for animation to complete
  }

  if (!isVisible) return null

  return (
    <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-b border-cyan-500/30 animate-in slide-in-from-top duration-300">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center space-x-3">
          <Zap className="w-5 h-5 text-cyan-400 animate-pulse" />
          <div>
            <span className="text-white font-medium">New AI insights detected!</span>
            <span className="text-gray-300 ml-2">Fresh data from GitHub, Hugging Face, and arXiv</span>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={handleDismiss} className="text-gray-400 hover:text-white">
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
