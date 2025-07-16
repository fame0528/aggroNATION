import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchTrendingModels, HuggingFaceModel } from '@/lib/api/huggingface';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<HuggingFaceModel[] | { error: string }>,
) {
  try {
    const { limit = 10, apiKey } = req.query;
    // Use the provided API key from env or query (for debugging)
    const key = typeof apiKey === 'string' ? apiKey : process.env.HUGGINGFACE_API_KEY;
    const models = await fetchTrendingModels(Number(limit), key);
    res.status(200).json(models);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
}
