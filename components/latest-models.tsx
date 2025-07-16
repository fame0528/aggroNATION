import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Brain, Download, ExternalLink, Zap, Sparkles } from 'lucide-react';

import useSWR from 'swr';
import { fetchLatestModels, HuggingFaceModel } from '@/lib/api/huggingface';

// Content-based color function for consistent but varied colors
const getContentBasedColor = (content: string): string => {
  const hash = content.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);

  const colorIndex = Math.abs(hash) % 8;
  const colors = [
    'bg-cyan-500/20 border-cyan-500/30 text-cyan-400',
    'bg-purple-500/20 border-purple-500/30 text-purple-400',
    'bg-green-500/20 border-green-500/30 text-green-400',
    'bg-orange-500/20 border-orange-500/30 text-orange-400',
    'bg-pink-500/20 border-pink-500/30 text-pink-400',
    'bg-yellow-500/20 border-yellow-500/30 text-yellow-400',
    'bg-blue-500/20 border-blue-500/30 text-blue-400',
    'bg-red-500/20 border-red-500/30 text-red-400',
  ];

  return colors[colorIndex];
};
export function LatestModels(): React.ReactElement {
  const { data, error, isLoading } = useSWR<HuggingFaceModel[]>(
    '/api/huggingface',
    () => fetchLatestModels(10),
    { revalidateOnFocus: false },
  );

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-white">
          <Brain className="w-5 h-5 text-purple-400" />
          <span>� Latest AI Models</span>
          <Badge
            variant="secondary"
            className="bg-purple-500/20 text-purple-400 border-purple-500/30"
          >
            Hugging Face
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && <div className="text-gray-400">Loading latest models...</div>}
        {error && <div className="text-red-400">Failed to load latest models.</div>}
        {data && data.length === 0 && <div className="text-gray-400">No models found.</div>}
        {data &&
          data.map((model: HuggingFaceModel) => (
            <div
              key={model.id}
              className="p-4 bg-gray-750 rounded-lg border border-gray-600 hover:border-purple-500/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold text-white">{model.modelId}</h3>
                </div>
                <div className="flex space-x-1">
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white"
                  >
                    <a
                      href={`https://huggingface.co/${model.modelId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                {model.tags.map((tag: string, idx: number) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className={`text-xs ${getContentBasedColor(tag)}`}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center justify-between text-sm text-gray-400">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center space-x-1">
                    <Download className="w-4 h-4" />
                    <span>{model.downloads}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Zap className="w-4 h-4" />
                    <span>{model.likes}</span>
                  </span>
                </div>
                <Badge
                  variant="outline"
                  className="text-xs bg-purple-500/20 border-purple-500 text-purple-400"
                >
                  {model.pipeline_tag}
                </Badge>
              </div>
            </div>
          ))}
      </CardContent>
    </Card>
  );
}
