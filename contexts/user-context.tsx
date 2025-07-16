"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface UserPreferences {
  theme: "dark" | "light"
  autoRefresh: boolean
  refreshInterval: number
  defaultView: "overview" | "repos" | "models" | "news"
  itemsPerPage: number
  showTrendingOnly: boolean
}

interface UserContextType {
  preferences: UserPreferences
  updatePreferences: (prefs: Partial<UserPreferences>) => void
  favorites: Record<string, string[]>
  addToFavorites: (type: string, id: string) => void
  removeFromFavorites: (type: string, id: string) => void
  isFavorite: (type: string, id: string) => boolean
  ratings: Record<string, number>
  rateItem: (id: string, rating: number) => void
  searchHistory: string[]
  addToSearchHistory: (query: string) => void
  clearSearchHistory: () => void
}

const defaultPreferences: UserPreferences = {
  theme: "dark",
  autoRefresh: true,
  refreshInterval: 5 * 60 * 1000, // 5 minutes
  defaultView: "overview",
  itemsPerPage: 20,
  showTrendingOnly: false,
}

const UserContext = createContext<UserContextType | null>(null)

export function useUserContext() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error("useUserContext must be used within a UserProvider")
  }
  return context
}

interface UserProviderProps {
  children: React.ReactNode
}

export function UserProvider({ children }: UserProviderProps) {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences)
  const [favorites, setFavorites] = useState<Record<string, string[]>>({})
  const [ratings, setRatings] = useState<Record<string, number>>({})
  const [searchHistory, setSearchHistory] = useState<string[]>([])

  // Load data from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedPreferences = localStorage.getItem("ai-pulse-preferences")
        if (savedPreferences) {
          setPreferences({ ...defaultPreferences, ...JSON.parse(savedPreferences) })
        }

        const savedFavorites = localStorage.getItem("ai-pulse-favorites")
        if (savedFavorites) {
          setFavorites(JSON.parse(savedFavorites))
        }

        const savedRatings = localStorage.getItem("ai-pulse-ratings")
        if (savedRatings) {
          setRatings(JSON.parse(savedRatings))
        }

        const savedSearchHistory = localStorage.getItem("ai-pulse-search-history")
        if (savedSearchHistory) {
          setSearchHistory(JSON.parse(savedSearchHistory))
        }
      } catch (error) {
        console.error("Error loading user data from localStorage:", error)
      }
    }
  }, [])

  // Save preferences to localStorage
  const updatePreferences = (newPrefs: Partial<UserPreferences>) => {
    const updated = { ...preferences, ...newPrefs }
    setPreferences(updated)

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("ai-pulse-preferences", JSON.stringify(updated))
      } catch (error) {
        console.error("Error saving preferences:", error)
      }
    }
  }

  // Favorites management
  const addToFavorites = (type: string, id: string) => {
    const updated = {
      ...favorites,
      [type]: [...(favorites[type] || []), id],
    }
    setFavorites(updated)

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("ai-pulse-favorites", JSON.stringify(updated))
      } catch (error) {
        console.error("Error saving favorites:", error)
      }
    }
  }

  const removeFromFavorites = (type: string, id: string) => {
    const updated = {
      ...favorites,
      [type]: (favorites[type] || []).filter((favId) => favId !== id),
    }
    setFavorites(updated)

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("ai-pulse-favorites", JSON.stringify(updated))
      } catch (error) {
        console.error("Error saving favorites:", error)
      }
    }
  }

  const isFavorite = (type: string, id: string): boolean => {
    return (favorites[type] || []).includes(id)
  }

  // Ratings management
  const rateItem = (id: string, rating: number) => {
    const updated = { ...ratings, [id]: rating }
    setRatings(updated)

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("ai-pulse-ratings", JSON.stringify(updated))
      } catch (error) {
        console.error("Error saving ratings:", error)
      }
    }
  }

  // Search history management
  const addToSearchHistory = (query: string) => {
    if (!query.trim()) return

    const updated = [query, ...searchHistory.filter((q) => q !== query)].slice(0, 10)
    setSearchHistory(updated)

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("ai-pulse-search-history", JSON.stringify(updated))
      } catch (error) {
        console.error("Error saving search history:", error)
      }
    }
  }

  const clearSearchHistory = () => {
    setSearchHistory([])

    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("ai-pulse-search-history")
      } catch (error) {
        console.error("Error clearing search history:", error)
      }
    }
  }

  const value: UserContextType = {
    preferences,
    updatePreferences,
    favorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    ratings,
    rateItem,
    searchHistory,
    addToSearchHistory,
    clearSearchHistory,
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}
