/**
 * Content Model
 * 
 * Stores fetched content from all sources
 * Cached in database to minimize external API calls
 * 
 * @module lib/db/models/Content
 * @created 2026-01-20
 */

import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IContent extends Document {
  sourceId: Types.ObjectId;
  sourceType: 'rss' | 'reddit' | 'youtube' | 'x';
  
  // Content data
  title: string;
  excerpt: string;
  url: string;
  externalId: string; // Original ID from source (video ID, post ID, etc.)
  
  // Metadata
  author: string;
  publishedAt: Date;
  tags: string[];
  
  // Engagement metrics (snapshot at fetch time)
  metrics: {
    upvotes: number;
    comments: number;
    shares: number;
    views: number;
    rating: number; // Our calculated rating (0-1)
  };
  
  // Rating algorithm data
  ratingData: {
    baseScore: number;
    decayFactor: number;
    lastCalculated: Date;
  };
  
  // Content lifecycle
  featured: boolean;
  archived: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

const ContentSchema = new Schema<IContent>(
  {
    sourceId: {
      type: Schema.Types.ObjectId,
      ref: 'Source',
      required: true,
    },
    sourceType: {
      type: String,
      required: true,
      enum: ['rss', 'reddit', 'youtube', 'x'],
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    excerpt: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    externalId: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: String,
      default: '',
      trim: true,
    },
    publishedAt: {
      type: Date,
      required: true,
    },
    tags: [{
      type: String,
      trim: true,
    }],
    metrics: {
      upvotes: { type: Number, default: 0 },
      comments: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
      views: { type: Number, default: 0 },
      rating: { type: Number, default: 0.5, min: 0, max: 1 },
    },
    ratingData: {
      baseScore: { type: Number, default: 0 },
      decayFactor: { type: Number, default: 1 },
      lastCalculated: { type: Date, default: Date.now },
    },
    featured: {
      type: Boolean,
      default: false,
    },
    archived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
ContentSchema.index({ sourceId: 1, externalId: 1 }, { unique: true }); // Prevent duplicates
ContentSchema.index({ sourceType: 1, archived: 1, 'metrics.rating': -1 }); // Main content query
ContentSchema.index({ publishedAt: -1 }); // Recent content
ContentSchema.index({ featured: 1 }); // Featured content
ContentSchema.index({ tags: 1 }); // Tag filtering

export const Content: Model<IContent> = 
  mongoose.models.Content || mongoose.model<IContent>('Content', ContentSchema);
