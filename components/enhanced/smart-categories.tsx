"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Brain,
  Eye,
  MessageSquare,
  Mic,
  ImageIcon,
  Code,
  Zap,
  TrendingUp,
  Filter,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { useRealTimeDataContext } from "@/contexts/real-time-data-context"

interface CategoryData {
  name: string
  icon: React.ComponentType<{ className?: string }>
  count: number
  percentage: number
  trend: string
  color: string
  description: string
}

export function SmartCategories() {
  const [showAll, setShowAll] = useState(false)
  const { repositories, models, news } = useRealTimeDataContext()

  // Safe data access with null checks
  const safeRepositories = Array.isArray(repositories) ? repositories : []
  const safeModels = Array.isArray(models) ? models : []
  const safeNews = Array.isArray(news) ? news : []

  const calculateCategoryData = (): CategoryData[] => {
    const categories = [
      {
        name: "Large Language Models",
        icon: Brain,
        color: "text-blue-400",
        description: "GPT, BERT, and other language models",
        keywords: ["llm", "gpt", "bert", "language model", "text-generation"],
      },
      {
        name: "Computer Vision",
        icon: Eye,
        color: "text-green-400",
        description: "Image recognition and visual AI",
        keywords: ["computer vision", "cv", "image", "vision", "yolo", "detection"],
      },
      {
        name: "Natural Language Processing",
        icon: MessageSquare,
        color: "text-purple-400",
        description: "Text analysis and understanding",
        keywords: ["nlp", "natural language", "text", "sentiment", "classification"],
      },
      {
        name: "Speech & Audio",
        icon: Mic,
        color: "text-orange-400",
        description: "Speech recognition and audio processing",
        keywords: ["speech", "audio", "voice", "whisper", "asr", "tts"],
      },
      {
        name: "Generative AI",
        icon: ImageIcon,
        color: "text-pink-400",
        description: "Content generation and creative AI",
        keywords: ["generative", "diffusion", "gan", "stable-diffusion", "midjourney"],
      },
      {
        name: "Code & Programming",
        icon: Code,
        color: "text-cyan-400",
        description: "AI for software development",
        keywords: ["code", "programming", "copilot", "codegen", "github"],
      },
      {
        name: "Machine Learning Frameworks",
        icon: Zap,
        color: "text-yellow-400",
        description: "ML libraries and tools",
        keywords: ["pytorch", "tensorflow", "keras", "scikit", "framework"],
      },
      {
        name: "Emerging Technologies",
        icon: TrendingUp,
        color: "text-red-400",
        description: "Cutting-edge AI research",
        keywords: ["quantum", "neuromorphic", "edge", "federated", "multimodal"],
      },
    ]

    return categories.map((category) => {
      let count = 0

      // Count repositories
      safeRepositories.forEach((repo) => {
        if (!repo) return
        const text = [
          repo.description || "",
          repo.full_name || "",
          ...(Array.isArray(repo.topics) ? repo.topics : []),
          ...(Array.isArray(repo.categories) ? repo.categories : []),
        ]
          .join(" ")
          .toLowerCase()

        if (category.keywords.some((keyword) => text.includes(keyword))) {
          count++
        }
      })

      // Count models
      safeModels.forEach((model) => {
        if (!model) return
        const text = [
          model.id || "",
          model.pipeline_tag || "",
          ...(Array.isArray(model.tags) ? model.tags : []),
          ...(Array.isArray(model.categories) ? model.categories : []),
        ]
          .join(" ")
          .toLowerCase()

        if (category.keywords.some((keyword) => text.includes(keyword))) {
          count++
        }
      })

      // Count news
      safeNews.forEach((article) => {
        if (!article) return
        const text = [
          article.title || "",
          article.description || "",
          ...(Array.isArray(article.tags) ? article.tags : []),
        ]
          .join(" ")
          .toLowerCase()

        if (category.keywords.some((keyword) => text.includes(keyword))) {
          count++
        }
      })

      const totalItems = safeRepositories.length + safeModels.length + safeNews.length
      const percentage = totalItems > 0 ? Math.round((count / totalItems) * 100) : 0

      return {
        ...category,
        count,
        percentage,
        trend: count > 10 ? "+15%" : count > 5 ? "+8%" : "+3%",
      }
    })
  }

  const categoryData = calculateCategoryData()
  const sortedCategories = categoryData.sort((a, b) => b.count - a.count)
  const displayCategories = showAll ? sortedCategories : sortedCategories.slice(0, 6)

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 text-white">
            <Filter className="w-5 h-5 text-cyan-400" />
            <span>🎯 Smart Categories</span>
            <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
              AI Powered
            </Badge>
          </CardTitle>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAll(!showAll)}
            className="text-gray-400 hover:text-white"
          >
            {showAll ? (
              <>
                <ChevronUp className="w-4 h-4 mr-1" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-1" />
                Show All
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {displayCategories.map((category, index) => (
          <div key={category.name} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <category.icon className={`w-5 h-5 ${category.color}`} />
                <div>
                  <h3 className="font-medium text-white text-sm">{category.name}</h3>
                  <p className="text-xs text-gray-400">{category.description}</p>
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm font-semibold text-white">{category.count}</div>
                <div className="text-xs text-green-400">{category.trend}</div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Market Share</span>
                <span className={category.color}>{category.percentage}%</span>
              </div>
              <Progress
                value={category.percentage}
                className="h-2"
                style={{
                  background: "rgb(55, 65, 81)",
                }}
              />
            </div>

            {index < displayCategories.length - 1 && <div className="border-b border-gray-700 pt-2"></div>}
          </div>
        ))}

        {!showAll && sortedCategories.length > 6 && (
          <div className="text-center pt-2">
            <p className="text-xs text-gray-400">+{sortedCategories.length - 6} more categories available</p>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-white">{safeRepositories.length}</div>
              <div className="text-xs text-gray-400">Repositories</div>
            </div>
            <div>
              <div className="text-lg font-bold text-white">{safeModels.length}</div>
              <div className="text-xs text-gray-400">Models</div>
            </div>
            <div>
              <div className="text-lg font-bold text-white">{safeNews.length}</div>
              <div className="text-xs text-gray-400">News Articles</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
