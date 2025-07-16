"use client"

export interface YouTubeVideo {
  id: string
  title: string
  description: string
  thumbnail: string
  publishedAt: string
  channelTitle: string
  channelId: string
  videoUrl: string
  duration?: string
  viewCount?: string
}

export interface YouTubeChannel {
  id: string
  name: string
  rssUrl: string
  description: string
}

// AI YouTube channels configuration
export const AI_YOUTUBE_CHANNELS: YouTubeChannel[] = [
  {
    id: "UC2WmuBuFq6gL08QYG-JjXKw",
    name: "WorldOfAI",
    rssUrl: "https://www.youtube.com/feeds/videos.xml?channel_id=UC2WmuBuFq6gL08QYG-JjXKw",
    description: "Pushing the creative use of AI applications",
  },
  {
    id: "UC5l7RouTQ60oUjLjt1Nh-UQ",
    name: "airevolutionx",
    rssUrl: "https://www.youtube.com/feeds/videos.xml?channel_id=UC5l7RouTQ60oUjLjt1Nh-UQ",
    description: "AI Revolution and emerging technologies",
  },
  {
    id: "UCpWS2Gmt0N31th-vdIizPJQ",
    name: "AstroKJ",
    rssUrl: "https://www.youtube.com/feeds/videos.xml?channel_id=UCpWS2Gmt0N31th-vdIizPJQ",
    description: "AI tutorials and practical applications",
  },
  {
    id: "UC0m81bQuthaQZmFbXEY9QSw",
    name: "AI Code King",
    rssUrl: "https://www.youtube.com/feeds/videos.xml?channel_id=UC0m81bQuthaQZmFbXEY9QSw",
    description: "AI coding tutorials and programming",
  },
  {
    id: "UC37JpWP5PxLSma2lh79HU9A",
    name: "Duncan Rogoff",
    rssUrl: "https://www.youtube.com/feeds/videos.xml?channel_id=UC37JpWP5PxLSma2lh79HU9A",
    description: "AI insights and technology discussions",
  },
  {
    id: "UCvS59S24crXmGfIEiejcr9g",
    name: "Code W Nathan",
    rssUrl: "https://www.youtube.com/feeds/videos.xml?channel_id=UCvS59S24crXmGfIEiejcr9g",
    description: "Coding with AI and development tutorials",
  },
  {
    id: "UC2Jl-LpV_J8l-az2GNG3VUQ",
    name: "AI Lockup",
    rssUrl: "https://www.youtube.com/feeds/videos.xml?channel_id=UC2Jl-LpV_J8l-az2GNG3VUQ",
    description: "AI news and industry updates",
  },
  {
    id: "UCGpsgNbzdF7BECCVbB1COHw",
    name: "Julian Goldie SEO",
    rssUrl: "https://www.youtube.com/feeds/videos.xml?channel_id=UCGpsgNbzdF7BECCVbB1COHw",
    description: "AI for SEO and digital marketing",
  },
  {
    id: "UCDN47rjzNMRTkGY3182ApaQ",
    name: "Goju Tech Talk",
    rssUrl: "https://www.youtube.com/feeds/videos.xml?channel_id=UCDN47rjzNMRTkGY3182ApaQ",
    description: "Technology discussions and AI insights",
  },
  {
    id: "UCZ3KGRwOA_uONNE_6VGG2bA",
    name: "roboverse987",
    rssUrl: "https://www.youtube.com/feeds/videos.xml?channel_id=UCZ3KGRwOA_uONNE_6VGG2bA",
    description: "Robotics and AI automation",
  },
  {
    id: "UC08Fah8EIryeOZRkjBRohcQ",
    name: "creator magic",
    rssUrl: "https://www.youtube.com/feeds/videos.xml?channel_id=UC08Fah8EIryeOZRkjBRohcQ",
    description: "AI tools for content creators",
  },
  {
    id: "UC4JX40jDee_tINbkjycV4Sg",
    name: "tech w/ tim",
    rssUrl: "https://www.youtube.com/feeds/videos.xml?channel_id=UC4JX40jDee_tINbkjycV4Sg",
    description: "Programming tutorials and AI development",
  },
  {
    id: "UCBhTxsFP2VvjO87RsQY75Tw",
    name: "brainprojectx",
    rssUrl: "https://www.youtube.com/feeds/videos.xml?channel_id=UCBhTxsFP2VvjO87RsQY75Tw",
    description: "AI projects and experiments",
  },
  {
    id: "UCPix8N6PMRI4KzgyjuZeF0g",
    name: "Fahd Mirza",
    rssUrl: "https://www.youtube.com/feeds/videos.xml?channel_id=UCPix8N6PMRI4KzgyjuZeF0g",
    description: "AI tutorials and technology reviews",
  },
]

export async function fetchYouTubeVideos(limit = 50): Promise<YouTubeVideo[]> {
  const allVideos: YouTubeVideo[] = [];
  const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || (typeof window !== 'undefined' ? undefined : require('process').env.NEXT_PUBLIC_YOUTUBE_API_KEY);

  for (const channel of AI_YOUTUBE_CHANNELS) {
    try {
      // Fetch latest videos for the channel
      const searchRes = await fetch(
        `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channel.id}&part=snippet,id&order=date&maxResults=8`
      );
      if (!searchRes.ok) throw new Error('Failed to fetch search results');
      const searchData = await searchRes.json();
      const videoItems = (searchData.items || []).filter((item: any) => item.id.kind === 'youtube#video');
      const videoIds = videoItems.map((item: any) => item.id.videoId).join(",");

      // Fetch video details (duration, viewCount)
      let detailsMap: Record<string, { duration: string; viewCount: string }> = {};
      if (videoIds) {
        const detailsRes = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?key=${apiKey}&id=${videoIds}&part=contentDetails,statistics`
        );
        if (detailsRes.ok) {
          const detailsData = await detailsRes.json();
          for (const v of detailsData.items || []) {
            detailsMap[v.id] = {
              duration: parseISODuration(v.contentDetails.duration),
              viewCount: v.statistics.viewCount || '0',
            };
          }
        }
      }

      for (const item of videoItems) {
        const videoId = item.id.videoId;
        const details = detailsMap[videoId] || { duration: 'Unknown', viewCount: 'Unknown' };
        allVideos.push({
          id: videoId,
          title: item.snippet.title || 'Untitled Video',
          description: (item.snippet.description || '').substring(0, 200) + '...',
          thumbnail: item.snippet.thumbnails?.high?.url || `/placeholder.svg?height=180&width=320`,
          publishedAt: item.snippet.publishedAt || new Date().toISOString(),
          channelTitle: channel.name,
          channelId: channel.id,
          videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
          duration: details.duration,
          viewCount: details.viewCount,
        });
      }

      // Rate limiting to avoid quota issues
      await new Promise((resolve) => setTimeout(resolve, 200));
    } catch (error) {
      console.error(`Error fetching videos from ${channel.name}:`, error);
    }
  }

  // Sort by publish date (newest first) and limit results
  return allVideos.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()).slice(0, limit);
}

// Helper to parse ISO 8601 duration (e.g., PT1H2M3S)
function parseISODuration(iso: string): string {
  if (!iso) return 'Unknown';
  const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
  const [, h, m, s] = iso.match(regex) || [];
  const hours = h ? String(h).padStart(2, '0') : '00';
  const mins = m ? String(m).padStart(2, '0') : '00';
  const secs = s ? String(s).padStart(2, '0') : '00';
  return hours !== '00' ? `${hours}:${mins}:${secs}` : `${mins}:${secs}`;
}

export function categorizeVideo(video: YouTubeVideo): string[] {
  const text = `${video.title} ${video.description}`.toLowerCase()
  const categories: string[] = []

  if (text.includes("tutorial") || text.includes("how to") || text.includes("guide")) {
    categories.push("Tutorial")
  }
  if (text.includes("news") || text.includes("update") || text.includes("announcement")) {
    categories.push("News")
  }
  if (text.includes("review") || text.includes("comparison") || text.includes("vs")) {
    categories.push("Review")
  }
  if (text.includes("coding") || text.includes("programming") || text.includes("development")) {
    categories.push("Programming")
  }
  if (text.includes("ai tool") || text.includes("software") || text.includes("app")) {
    categories.push("Tools")
  }
  if (text.includes("business") || text.includes("marketing") || text.includes("seo")) {
    categories.push("Business")
  }

  return categories.length > 0 ? categories : ["General"]
}
