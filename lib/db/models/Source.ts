/**
 * Source Model
 * 
 * Stores external content sources (YouTube channels, Reddit subs, RSS feeds, X accounts)
 * Admin-configurable with enable/disable toggles
 * 
 * @module lib/db/models/Source
 * @created 2026-01-20
 */

import mongoose, { Schema, Document, Model } from 'mongoose';

export type SourceType = 'rss' | 'reddit' | 'youtube' | 'x';

export interface ISource extends Document {
  type: SourceType;
  name: string;
  url: string;
  enabled: boolean;
  config: {
    fetchInterval: number; // Minutes between fetches
    priority: 'low' | 'medium' | 'high';
    maxItems: number; // Max items to fetch per cycle
    tags: string[]; // Auto-applied tags
  };
  metadata: {
    lastFetched: Date | null;
    lastError: string | null;
    totalFetched: number;
    consecutiveErrors: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const SourceSchema = new Schema<ISource>(
  {
    type: {
      type: String,
      required: true,
      enum: ['rss', 'reddit', 'youtube', 'x'],
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    enabled: {
      type: Boolean,
      default: true,
    },
    config: {
      fetchInterval: {
        type: Number,
        default: 60, // 1 hour default
        min: 5,
      },
      priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium',
      },
      maxItems: {
        type: Number,
        default: 50,
        min: 1,
        max: 200,
      },
      tags: [{
        type: String,
        trim: true,
      }],
    },
    metadata: {
      lastFetched: {
        type: Date,
        default: null,
      },
      lastError: {
        type: String,
        default: null,
      },
      totalFetched: {
        type: Number,
        default: 0,
      },
      consecutiveErrors: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for query performance
SourceSchema.index({ type: 1, enabled: 1 });
SourceSchema.index({ enabled: 1, 'config.priority': -1 });

export const Source: Model<ISource> = 
  mongoose.models.Source || mongoose.model<ISource>('Source', SourceSchema);
