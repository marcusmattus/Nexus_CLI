import React from 'react';

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  ANALYZER = 'ANALYZER',
  BUILDER = 'BUILDER',
  DOWNLOAD = 'DOWNLOAD',
  SETTINGS = 'SETTINGS'
}

export interface NexusArgument {
  name: string;
  cli: string;
  position: 'flag' | 'positional';
  type: string;
  required: boolean;
  default?: string | number | boolean;
  multiple?: boolean;
  env?: string;
  description: string;
  source_parameter?: string;
  confidence: number;
}

export interface NexusCommand {
  name: string;
  id: string;
  description: string;
  source_file: string;
  source_range?: { start_line: number; end_line: number };
  language: string;
  entrypoint: string;
  runtime: string;
  arguments: NexusArgument[];
  returns: string;
  async: boolean;
  confidence: number;
  examples: string[];
}

export interface NexusManifest {
  namespace: string;
  source: string;
  generated_at: string;
  language: string;
  commands: NexusCommand[];
  warnings?: string[];
}

export interface AnalysisState {
  isAnalyzing: boolean;
  error: string | null;
  result: NexusManifest | null;
}

export interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
}

export interface InsightResult {
  text: string;
  groundingChunks: any[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}