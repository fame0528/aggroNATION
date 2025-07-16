'use client';

import React, { ReactElement } from 'react';
import useSWR from 'swr';
import { useRouter, useSearchParams } from 'next/navigation';
import { Pagination } from '@/components/pagination';
import { Loader, ErrorMessage, Skeleton } from '@/components/shared-ui';
import { useCategoryContext } from '@/contexts/category-context';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Brain,
  Download,
  ExternalLink,
  Zap,
  Sparkles,
  Search,
  Filter,
  Image,
  MessageCircle,
  Mic,
  Eye,
} from 'lucide-react';

// Function to generate basic description if none exists
const getModelDescription = (model: HuggingFaceModel) => {
  if (model.summary || model.description) {
    return model.summary || model.description;
  }

  const pipelineTag = model.pipeline_tag || '';
  const modelName = getModelName(model.modelId);

  // Generate basic descriptions based on model type
  if (pipelineTag.includes('text-to-image') || pipelineTag.includes('image-to-image')) {
    return `AI model for generating images from text prompts. Part of the ${model.author} collection.`;
  } else if (pipelineTag.includes('text-generation') || pipelineTag.includes('conversational')) {
    return `Large language model for text generation and conversation. Created by ${model.author}.`;
  } else if (pipelineTag.includes('automatic-speech-recognition')) {
    return `Speech recognition model that converts audio to text. Developed by ${model.author}.`;
  } else if (
    pipelineTag.includes('image-classification') ||
    pipelineTag.includes('object-detection')
  ) {
    return `Computer vision model for image analysis and classification. Built by ${model.author}.`;
  } else if (
    pipelineTag.includes('sentence-similarity') ||
    pipelineTag.includes('feature-extraction')
  ) {
    return `Text embedding model for semantic similarity and feature extraction. From ${model.author}.`;
  } else if (pipelineTag.includes('translation')) {
    return `Translation model for converting text between languages. By ${model.author}.`;
  } else {
    return `AI model for ${pipelineTag.replace('-', ' ')} tasks. Created by ${model.author}.`;
  }
};

// Function to extract model name from modelId
const getModelName = (modelId: string) => {
  if (modelId.includes('/')) {
    return modelId.split('/').slice(1).join('/'); // Get everything after the first slash
  }
  return modelId;
};

// Function to get icon for model type
const getModelIcon = (model: HuggingFaceModel) => {
  const pipelineTag = model.pipeline_tag || '';
  const modelId = model.modelId.toLowerCase();
  const tags = (model.tags || []).join(' ').toLowerCase();

  // More specific icon mapping based on model type
  if (
    pipelineTag.includes('text-to-image') ||
    pipelineTag.includes('image-to-image') ||
    modelId.includes('diffusion') ||
    modelId.includes('flux') ||
    modelId.includes('sdxl') ||
    tags.includes('stable-diffusion') ||
    tags.includes('diffusion')
  ) {
    return <Image className="w-5 h-5 text-purple-400" />;
  } else if (
    pipelineTag.includes('text-generation') ||
    pipelineTag.includes('conversational') ||
    modelId.includes('llama') ||
    modelId.includes('gpt') ||
    modelId.includes('chat') ||
    tags.includes('llm') ||
    tags.includes('language-model')
  ) {
    return <MessageCircle className="w-5 h-5 text-cyan-400" />;
  } else if (
    pipelineTag.includes('automatic-speech-recognition') ||
    pipelineTag.includes('audio') ||
    modelId.includes('whisper') ||
    tags.includes('speech') ||
    tags.includes('audio')
  ) {
    return <Mic className="w-5 h-5 text-green-400" />;
  } else if (
    pipelineTag.includes('image-classification') ||
    pipelineTag.includes('object-detection') ||
    pipelineTag.includes('image-segmentation') ||
    modelId.includes('yolo') ||
    tags.includes('vision') ||
    tags.includes('detection') ||
    tags.includes('classification')
  ) {
    return <Eye className="w-5 h-5 text-orange-400" />;
  } else if (
    pipelineTag.includes('sentence-similarity') ||
    pipelineTag.includes('feature-extraction') ||
    pipelineTag.includes('text-embedding') ||
    modelId.includes('embedding') ||
    tags.includes('sentence-transformers') ||
    tags.includes('embedding')
  ) {
    return <Zap className="w-5 h-5 text-yellow-400" />;
  } else if (
    pipelineTag.includes('translation') ||
    tags.includes('translation') ||
    modelId.includes('translate') ||
    tags.includes('multilingual')
  ) {
    return <Sparkles className="w-5 h-5 text-pink-400" />;
  } else {
    return <Brain className="w-5 h-5 text-purple-400" />;
  }
};

const extractLicense = (tags: string[]): string | null => {
  const licenseTag = tags.find((tag) => tag.startsWith('license:'));
  return licenseTag ? licenseTag.replace('license:', '').toUpperCase() : null;
};

// Function to extract model size from tags
const extractModelSize = (tags: string[]): string | null => {
  const sizeTag = tags.find(
    (tag) =>
      tag.includes('7b') ||
      tag.includes('13b') ||
      tag.includes('30b') ||
      tag.includes('65b') ||
      tag.includes('175b') ||
      tag.includes('billion') ||
      tag.includes('parameters') ||
      tag.includes('param'),
  );
  return sizeTag ? sizeTag.replace(/[-_]/g, ' ').toUpperCase() : null;
};

// Function to format large numbers with K, M, B suffixes
const formatLargeNumber = (num: number): string => {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B';
  } else if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

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

// Map sidebar categories to model tags/keywords
const CATEGORY_MAP: Record<string, string[]> = {
  'Generative AI': [
    'generative',
    'text-generation',
    'diffusion',
    'gpt',
    'stable diffusion',
    'sdxl',
    'llm',
    'ai',
    'chat',
  ],
  'Computer Vision': ['vision', 'image', 'detection', 'yolo', 'cv'],
  'NLP & LLMs': ['nlp', 'llm', 'language', 'bert', 'gpt', 'text'],
  'Ethics & Safety': ['ethics', 'safety', 'alignment', 'responsible', 'bias'],
  MLOps: ['mlops', 'deployment', 'pipeline', 'ops', 'monitoring'],
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());
interface HuggingFaceModel {
  modelId: string;
  author?: string;
  downloads?: number;
  likes?: number;
  pipeline_tag?: string;
  tags?: string[];
  lastModified?: string;
  summary?: string;
  description?: string;
  library_name?: string;
  cardData?: {
    summary?: string;
    description?: string;
    // downloads?: { url: string }[]; // Removed duplicate/incorrect type
  };
  license?: string;
}

export function ModelsPage(): ReactElement {
  const { selectedCategory } = useCategoryContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = React.useState<string>(searchParams?.get('search') || '');
  const [currentPage, setCurrentPage] = React.useState<number>(
    parseInt(searchParams?.get('page') || '1'),
  );
  const pageSize = 24;

  // Sync state to URL
  React.useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (selectedCategory) params.set('category', selectedCategory);
    if (currentPage > 1) params.set('page', String(currentPage));
    router.replace(`?${params.toString()}`);
  }, [search, selectedCategory, currentPage, router]);

  // Fetch paginated models
  const { data, error, isLoading, mutate } = useSWR(
    `/api/models?page=${currentPage}&limit=${pageSize}${search ? `&search=${encodeURIComponent(search)}` : ''}${selectedCategory ? `&category=${encodeURIComponent(selectedCategory)}` : ''}`,
    fetcher,
    { refreshInterval: 300000 },
  );

  const models = data?.items || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  // User-friendly category label
  const CATEGORY_LABELS: Record<string, string> = {
    'text-generation': 'Text Generation',
    'text-to-image': 'Text-to-Image',
    'automatic-speech-recognition': 'Speech Recognition',
  };

  // Reset page when search/category changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCategory]);

  // Pagination handler
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col flex-1 min-h-screen w-full bg-gray-900 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-8 px-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white">� AI Models</h1>
          <p className="text-gray-400">
            Explore the latest production-ready AI models curated by aggroNATION • {totalCount}{' '}
            models found
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            className="border-gray-600 text-gray-300 bg-transparent hover:bg-gray-800"
            aria-label="Filter models"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* Search Section */}
      <div className="flex space-x-4 px-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search models..."
            className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-cyan-500"
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            aria-label="Search models"
          />
        </div>
      </div>

      <hr className="my-4 border-gray-700/40" />
      {/* Models List */}
      <div className="grid gap-8 grid-cols-1 xl:grid-cols-2">
        {isLoading && <Skeleton count={8} />}
        {error && (
          <ErrorMessage error={error.message || 'Failed to load models'} onRetry={() => mutate()} />
        )}
        {!isLoading &&
          !error &&
          models.map((model: HuggingFaceModel, modelIndex: number) => {
            const externalUrl = `https://huggingface.co/${model.modelId}`;
            return (
              <Card
                key={model.modelId}
                className="bg-gray-800/80 border border-gray-700/40 hover:border-purple-500/40 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-200 w-full"
              >
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Header with icon and title */}
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 p-2 rounded-lg bg-gray-700/60">
                        {getModelIcon(model)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-1">
                              <span className="truncate">{getModelName(model.modelId)}</span>
                              {model.pipeline_tag === 'text-to-image' && (
                                <Sparkles className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                              )}
                            </h3>
                            <div className="flex items-center gap-4 text-xs text-gray-400 flex-wrap">
                              <span className="font-medium text-purple-400">By {model.author}</span>
                              <span className="hidden sm:flex items-center gap-1">
                                <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                                <span>
                                  {model.lastModified
                                    ? `Updated ${new Date(model.lastModified).toLocaleDateString()}`
                                    : 'Recently updated'}
                                </span>
                              </span>
                              {model.downloads && model.downloads > 0 && (
                                <span className="flex items-center gap-1 text-green-400">
                                  <Download className="w-4 h-4" />
                                  <span className="font-medium">
                                    {formatLargeNumber(model.downloads)} downloads
                                  </span>
                                </span>
                              )}
                              {model.likes && model.likes > 0 && (
                                <span className="flex items-center gap-1 text-pink-400">
                                  <span>❤️</span>
                                  <span className="font-medium">
                                    {formatLargeNumber(model.likes)} likes
                                  </span>
                                </span>
                              )}
                              {extractLicense(model.tags || []) && (
                                <span className="flex items-center gap-1">
                                  <span className="text-green-400 font-medium">License:</span>
                                  <span className="text-white">
                                    {extractLicense(model.tags || [])}
                                  </span>
                                </span>
                              )}
                              {model.library_name && (
                                <span className="flex items-center gap-1">
                                  <span className="text-purple-400 font-medium">Framework:</span>
                                  <span className="text-white">{model.library_name}</span>
                                </span>
                              )}
                              {model.pipeline_tag && (
                                <span className="flex items-center gap-1">
                                  <span className="text-cyan-400 font-medium">Type:</span>
                                  <span className="text-white">
                                    {CATEGORY_LABELS[model.pipeline_tag] || model.pipeline_tag}
                                  </span>
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            <a
                              href={externalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              title={`View ${model.modelId} on Hugging Face`}
                            >
                              <Button
                                size="sm"
                                className="text-cyan-300 hover:text-white bg-gradient-to-r from-cyan-900/50 to-cyan-800/50 border border-cyan-700 hover:border-cyan-400 hover:from-cyan-900 hover:to-cyan-800 transition-all duration-200"
                                aria-label={`View ${model.modelId} on Hugging Face`}
                              >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                View on Hugging Face
                              </Button>
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="mb-2">
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {getModelDescription(model)}
                      </p>
                    </div>

                    {/* Tags section */}
                    <div className="flex flex-wrap gap-2">
                      {(model.tags || [])
                        .filter(
                          (tag) =>
                            !tag.startsWith('license:') &&
                            !tag.startsWith('dataset:') &&
                            !tag.startsWith('arxiv:') &&
                            !tag.startsWith('base_model:') &&
                            !tag.includes('compatible') &&
                            !tag.includes('region:') &&
                            tag.length > 2,
                        )
                        .slice(0, 8)
                        .map((tag: string, idx: number) => (
                          <Badge
                            key={tag}
                            className={`text-xs px-3 py-1 ${getContentBasedColor(tag, modelIndex)} hover:scale-105 transition-transform cursor-default`}
                          >
                            {tag}
                          </Badge>
                        ))}
                      {(model.tags || []).length > 8 && (
                        <Badge className="text-xs px-3 py-1 bg-gray-600/20 border-gray-500/30 text-gray-400">
                          +{(model.tags || []).length - 8} more
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        {!isLoading && !error && models.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            No models found for your search or filter.
          </div>
        )}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        totalCount={totalCount}
        pageSize={pageSize}
      />
    </div>
  );
}
