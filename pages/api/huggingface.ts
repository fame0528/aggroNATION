import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchLatestModels, HuggingFaceModel } from '@/lib/api/huggingface';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<HuggingFaceModel[] | { error: string }>,
) {
  try {
    const { limit = 10 } = req.query;
    const models = await fetchLatestModels(Number(limit));
    res.status(200).json(models);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
}
