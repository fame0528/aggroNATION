"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Zap, Heart, Brain, Sparkles } from "lucide-react"

interface PulsePalsMascotProps {
  isLoading?: boolean
  mood?: "happy" | "excited" | "thinking" | "sleeping"
  message?: string
}

export function PulsePalsMascot({ isLoading = false, mood = "happy", message }: PulsePalsMascotProps) {
  const [currentMood, setCurrentMood] = useState(mood)
  const [isAnimating, setIsAnimating] = useState(false)
  const [currentMessage, setCurrentMessage] = useState(message)

  // Auto-change mood based on loading state
  useEffect(() => {
    if (isLoading) {
      setCurrentMood("thinking")
      setCurrentMessage("Fetching fresh AI data...")
    } else {
      setCurrentMood("happy")
      setCurrentMessage(message || "All systems operational! 🚀")
    }
  }, [isLoading, message])

  // Animation trigger
  useEffect(() => {
    setIsAnimating(true)
    const timer = setTimeout(() => setIsAnimating(false), 1000)
    return () => clearTimeout(timer)
  }, [currentMood])

  const getMascotEmoji = () => {
    switch (currentMood) {
      case "excited":
        return "🤖✨"
      case "thinking":
        return "🤖💭"
      case "sleeping":
        return "🤖💤"
      default:
        return "🤖💙"
    }
  }

  const getMoodColor = () => {
    switch (currentMood) {
      case "excited":
        return "text-yellow-400"
      case "thinking":
        return "text-blue-400"
      case "sleeping":
        return "text-gray-400"
      default:
        return "text-cyan-400"
    }
  }

  const getMoodIcon = () => {
    switch (currentMood) {
      case "excited":
        return <Sparkles className="w-4 h-4" />
      case "thinking":
        return <Brain className="w-4 h-4" />
      case "sleeping":
        return <Heart className="w-4 h-4" />
      default:
        return <Zap className="w-4 h-4" />
    }
  }

  return (
    <Card className="bg-gray-800 border-gray-700 p-4 max-w-sm">
      <div className="flex items-center space-x-3">
        <div className={`text-3xl transition-transform duration-500 ${isAnimating ? "scale-110" : "scale-100"}`}>
          {getMascotEmoji()}
        </div>

        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-sm font-medium text-white">Pulse Pal</span>
            <Badge variant="outline" className={`text-xs border-current ${getMoodColor()}`}>
              <div className="flex items-center space-x-1">
                {getMoodIcon()}
                <span className="capitalize">{currentMood}</span>
              </div>
            </Badge>
          </div>

          <p className="text-xs text-gray-400">{currentMessage}</p>
        </div>
      </div>

      {isLoading && (
        <div className="mt-3 flex items-center space-x-2">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
          <span className="text-xs text-gray-400">Processing...</span>
        </div>
      )}
    </Card>
  )
}
