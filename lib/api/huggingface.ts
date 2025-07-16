export interface HuggingFaceModel {
  id: string;
  modelId: string;
  author: string;
  downloads: number;
  likes: number;
  tags: string[];
  pipeline_tag: string | null;
  library_name: string | null;
  created_at: string;
  lastModified: string;
  summary?: string;
  description?: string;
}

export async function fetchLatestModels(limit = 50): Promise<HuggingFaceModel[]> {
  // unchanged, just for reference
  try {
    const apiKey =
      process.env.HUGGINGFACE_API_KEY ||
      (typeof window !== 'undefined' ? undefined : require('process').env.HUGGINGFACE_API_KEY);
    const url = `https://huggingface.co/api/models?limit=${Math.min(limit, 100)}&sort=downloads&direction=-1`;
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'aggroNATION-Dashboard',
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
    });
    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${response.status}`);
    }
    const data = await response.json();
    if (!Array.isArray(data)) {
      console.warn('Hugging Face API returned unexpected data structure');
      return [];
    }
    return data.map((model: any) => {
      const modelId = model.id || model.modelId || 'unknown';
      const author = modelId.includes('/') ? modelId.split('/')[0] : 'unknown';

      return {
        id: modelId,
        modelId: modelId,
        author: author,
        downloads: model.downloads || 0,
        likes: model.likes || 0,
        tags: Array.isArray(model.tags) ? model.tags : [],
        pipeline_tag: model.pipeline_tag,
        library_name: model.library_name,
        created_at: model.createdAt || model.created_at || new Date().toISOString(),
        lastModified: model.lastModified || model.updatedAt || new Date().toISOString(),
        summary: model.summary || '',
        description: model.description || '',
      };
    });
  } catch (error) {
    console.error('Error fetching Hugging Face models:', error);
    return [];
  }
}

export async function fetchTrendingModels(
  limit = 50,
  apiKeyOverride?: string,
): Promise<HuggingFaceModel[]> {
  try {
    // Use override if provided, else env var, else fail
    const apiKey =
      apiKeyOverride ||
      process.env.HUGGINGFACE_API_KEY ||
      (typeof window !== 'undefined' ? undefined : require('process').env.HUGGINGFACE_API_KEY);

    if (!apiKey) {
      console.warn('No Hugging Face API key provided, returning empty array');
      return [];
    }

    // Try a simpler API endpoint that definitely exists
    const url = `https://huggingface.co/api/models?limit=${Math.min(limit, 100)}&sort=downloads&direction=-1`;
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'aggroNATION-Dashboard',
        // Make Authorization header optional since HF API may not require it for public models
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
    });

    if (!response.ok) {
      console.error(`Hugging Face API error: ${response.status} ${response.statusText}`);
      // Try without auth headers if we got a 400/401 error
      if (response.status === 400 || response.status === 401) {
        console.log('Retrying without authentication...');
        const fallbackResponse = await fetch(url, {
          headers: {
            Accept: 'application/json',
            'User-Agent': 'aggroNATION-Dashboard',
          },
        });

        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          if (Array.isArray(fallbackData)) {
            return fallbackData.slice(0, limit).map((model: any) => {
              const modelId = model.id || model.modelId || 'unknown';
              const author = modelId.includes('/') ? modelId.split('/')[0] : 'unknown';

              return {
                id: modelId,
                modelId: modelId,
                author: author,
                downloads: model.downloads || 0,
                likes: model.likes || 0,
                tags: model.tags || [],
                pipeline_tag: model.pipeline_tag || null,
                library_name: model.library_name || null,
                created_at: model.createdAt || model.created_at || new Date().toISOString(),
                lastModified: model.lastModified || model.updatedAt || new Date().toISOString(),
                summary: model.summary || '',
                description: model.description || '',
              };
            });
          }
        }
      }

      // Return empty array instead of throwing to prevent app crashes
      return [];
    }

    const data = await response.json();
    if (!Array.isArray(data)) {
      console.warn('Hugging Face API returned unexpected data structure');
      return [];
    }

    return data.map((model: any) => {
      const modelId = model.id || model.modelId || 'unknown';
      const author = modelId.includes('/') ? modelId.split('/')[0] : 'unknown';

      return {
        id: modelId,
        modelId: modelId,
        author: author,
        downloads: model.downloads || 0,
        likes: model.likes || 0,
        tags: Array.isArray(model.tags) ? model.tags : [],
        pipeline_tag: model.pipeline_tag,
        library_name: model.library_name,
        created_at: model.createdAt || model.created_at || new Date().toISOString(),
        lastModified: model.lastModified || model.updatedAt || new Date().toISOString(),
        summary: model.summary || '',
        description: model.description || '',
      };
    });
  } catch (error) {
    console.error('Error fetching Hugging Face trending models:', error);
    return [];
  }
}
