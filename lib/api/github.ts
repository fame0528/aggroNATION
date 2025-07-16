"use client"

export interface GitHubRepo {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  stargazers_count: number
  forks_count: number
  language: string | null
  created_at: string
  updated_at: string
  owner: {
    login: string
    avatar_url: string
  }
  topics: string[]
}

export async function fetchTrendingRepos(
  timeframe: "daily" | "weekly" | "monthly" = "weekly",
  limit = 50,
): Promise<GitHubRepo[]> {
  try {
    // Using GitHub Search API to get trending repositories
    const query = `created:>${getDateString(timeframe)} stars:>10`
    const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=${Math.min(limit, 100)}`

    const response = await fetch(url, {
      headers: {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "AI-Pulse-Dashboard",
      },
    })

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`)
    }

    const data = await response.json()

    if (!data.items || !Array.isArray(data.items)) {
      console.warn("GitHub API returned unexpected data structure")
      return []
    }

    return data.items.map((repo: any) => ({
      id: repo.id || 0,
      name: repo.name || "Unknown",
      full_name: repo.full_name || "unknown/unknown",
      description: repo.description,
      html_url: repo.html_url || "#",
      stargazers_count: repo.stargazers_count || 0,
      forks_count: repo.forks_count || 0,
      language: repo.language,
      created_at: repo.created_at || new Date().toISOString(),
      updated_at: repo.updated_at || new Date().toISOString(),
      owner: {
        login: repo.owner?.login || "unknown",
        avatar_url: repo.owner?.avatar_url || "/placeholder.svg?height=40&width=40",
      },
      topics: Array.isArray(repo.topics) ? repo.topics : [],
    }))
  } catch (error) {
    console.error("Error fetching trending repos:", error)
    return []
  }
}

/**
 * Categorise a GitHub repository into one or more AI-related topics.
 */
export function categorizeRepo(repo: Pick<GitHubRepo, "description" | "topics"> & { topics?: string[] }): string[] {
  const description = repo.description?.toLowerCase() ?? ""
  const topics = repo.topics ?? []
  const allText = [...topics, description].join(" ")

  const categories: string[] = []

  if (
    allText.includes("llm") ||
    allText.includes("language model") ||
    allText.includes("gpt") ||
    allText.includes("bert")
  ) {
    categories.push("LLM")
  }
  if (
    allText.includes("computer vision") ||
    allText.includes("cv") ||
    allText.includes("image") ||
    allText.includes("vision")
  ) {
    categories.push("Computer Vision")
  }
  if (allText.includes("generative") || allText.includes("diffusion") || allText.includes("gan")) {
    categories.push("Generative AI")
  }
  if (allText.includes("nlp") || allText.includes("natural language")) {
    categories.push("NLP")
  }
  if (allText.includes("speech") || allText.includes("audio") || allText.includes("voice")) {
    categories.push("Speech & Audio")
  }
  if (allText.includes("robotics") || allText.includes("robot")) {
    categories.push("Robotics")
  }

  // Fallback
  return categories.length > 0 ? categories : ["General AI"]
}

function getDateString(timeframe: "daily" | "weekly" | "monthly"): string {
  const now = new Date()
  const days = timeframe === "daily" ? 1 : timeframe === "weekly" ? 7 : 30
  const date = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
  return date.toISOString().split("T")[0]
}
