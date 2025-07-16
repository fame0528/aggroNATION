import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Brain, Download, ExternalLink, Zap, Flame } from 'lucide-react';
import { useDataContext } from '@/contexts/data-context';
import { formatNumber, formatCompactNumber } from '@/lib/utils/number-format';

// Function to generate consistent but varied colors based on content
const getContentBasedColor = (content: string, modelIndex: number) => {
  // Create a simple hash from the content and model index for variety
  const hash = content.split('').reduce((acc, char, idx) => {
    return acc + char.charCodeAt(0) * (idx + 1) + modelIndex * 7;
  }, 0);

  const colors = [
    'bg-cyan-500/20 border-cyan-500 text-cyan-400',
    'bg-purple-500/20 border-purple-500 text-purple-400',
    'bg-green-500/20 border-green-500 text-green-400',
    'bg-orange-500/20 border-orange-500 text-orange-400',
    'bg-pink-500/20 border-pink-500 text-pink-400',
    'bg-yellow-500/20 border-yellow-500 text-yellow-400',
    'bg-blue-500/20 border-blue-500 text-blue-400',
    'bg-red-500/20 border-red-500 text-red-400',
    'bg-indigo-500/20 border-indigo-500 text-indigo-400',
    'bg-teal-500/20 border-teal-500 text-teal-400',
  ];

  return colors[Math.abs(hash) % colors.length];
};

// Function to generate a description for a model (copied from models-page.tsx)
const getModelDescription = (model: any) => {
  if (model.summary || model.description) {
    return model.summary || model.description;
  }
  const pipelineTag = model.pipeline_tag || '';
  const author = model.author || (model.modelId && model.modelId.split('/')[0]) || 'Unknown';
  // Generate basic descriptions based on model type
  if (pipelineTag.includes('text-to-image') || pipelineTag.includes('image-to-image')) {
    return `AI model for generating images from text prompts. Part of the ${author} collection.`;
  } else if (pipelineTag.includes('text-generation') || pipelineTag.includes('conversational')) {
    return `Large language model for text generation and conversation. Created by ${author}.`;
  } else if (pipelineTag.includes('automatic-speech-recognition')) {
    return `Speech recognition model that converts audio to text. Developed by ${author}.`;
  } else if (
    pipelineTag.includes('image-classification') ||
    pipelineTag.includes('object-detection')
  ) {
    return `Computer vision model for image analysis and classification. Built by ${author}.`;
  } else if (
    pipelineTag.includes('sentence-similarity') ||
    pipelineTag.includes('feature-extraction')
  ) {
    return `Text embedding model for semantic similarity and feature extraction. From ${author}.`;
  } else if (pipelineTag.includes('translation')) {
    return `Translation model for converting text between languages. By ${author}.`;
  } else {
    return `AI model for ${pipelineTag.replace('-', ' ')} tasks. Created by ${author}.`;
  }
};

export function TrendingModels(): React.ReactElement {
  const { models, loading, error } = useDataContext();
  // Use the first 24 models as trending to match other components
  const trending = Array.isArray(models) ? models.slice(0, 24) : [];

  return (
    <Card className="bg-gray-800 border-gray-700 h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center space-x-2 text-white">
          <Brain className="w-5 h-5 text-orange-400" />
          <span>🔥 Trending AI Models</span>
          <Badge
            variant="secondary"
            className="bg-orange-500/20 text-orange-400 border-orange-500/30"
          >
            Hugging Face
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <div className="space-y-3 h-full overflow-y-auto pr-2">
          {loading?.models && <div className="text-gray-400">Loading trending models...</div>}
          {error?.models && <div className="text-red-400">Failed to load trending models.</div>}
          {/* Never show empty state: always show at least a placeholder if no data */}
          {trending.length === 0 && !loading?.models && !error?.models && (
            <div className="text-gray-400 text-center py-8">
              <Flame className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No trending models found.</p>
            </div>
          )}
          {trending.map((model: any, modelIndex: number) => (
            <div
              key={model.id || model.modelId}
              className="p-3 bg-gray-750 rounded-lg border border-gray-600 hover:border-orange-500/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2 flex-1">
                  <h3 className="font-semibold text-white text-sm truncate">
                    {model.modelId || model.id}
                  </h3>
                </div>
                <div className="flex space-x-1 shrink-0">
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white"
                  >
                    <a
                      href={`https://huggingface.co/${model.modelId || model.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                </div>
              </div>

              {/* Model summary/description */}
              <p className="text-gray-300 text-sm mb-2 line-clamp-2">
                {getModelDescription(model)}
              </p>

              <div className="flex flex-wrap gap-2 mb-2">
                {model.tags?.slice(0, 3).map((tag: string, idx: number) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className={`text-xs ${getContentBasedColor(tag, modelIndex)}`}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center justify-between text-sm text-gray-400">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center space-x-1">
                    <Download className="w-4 h-4" />
                    <span>{formatCompactNumber(model.downloads || 0)}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Zap className="w-4 h-4" />
                    <span>{formatCompactNumber(model.likes || 0)}</span>
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {model.pipeline_tag && (
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        model.pipeline_tag === 'text-generation'
                          ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
                          : model.pipeline_tag === 'text-to-image' ||
                              model.pipeline_tag === 'image-to-text'
                            ? 'bg-purple-500/20 border-purple-500 text-purple-400'
                            : model.pipeline_tag === 'conversational' ||
                                model.pipeline_tag === 'question-answering'
                              ? 'bg-green-500/20 border-green-500 text-green-400'
                              : model.pipeline_tag === 'translation' ||
                                  model.pipeline_tag === 'summarization'
                                ? 'bg-orange-500/20 border-orange-500 text-orange-400'
                                : model.pipeline_tag === 'classification' ||
                                    model.pipeline_tag === 'feature-extraction'
                                  ? 'bg-pink-500/20 border-pink-500 text-pink-400'
                                  : 'bg-blue-500/20 border-blue-500 text-blue-400'
                      }`}
                    >
                      {model.pipeline_tag}
                    </Badge>
                  )}
                  {model.library_name && (
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        model.library_name === 'transformers'
                          ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400'
                          : model.library_name === 'diffusers'
                            ? 'bg-red-500/20 border-red-500 text-red-400'
                            : model.library_name === 'pytorch'
                              ? 'bg-orange-500/20 border-orange-500 text-orange-400'
                              : 'bg-blue-500/20 border-blue-500 text-blue-400'
                      }`}
                    >
                      {model.library_name}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
