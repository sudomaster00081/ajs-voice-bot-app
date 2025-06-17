export interface AIProvider {
  id: string;
  name: string;
  description: string;
  icon: string;
  requiresApiKey: boolean;
  models: AIModel[];
  endpoint?: string;
  headers?: Record<string, string>;
}

export interface AIModel {
  id: string;
  name: string;
  description: string;
  maxTokens: number;
  costPer1kTokens?: number;
}

export interface AIConfig {
  provider: string;
  model: string;
  apiKey: string;
  customEndpoint?: string;
  customModel?: string;
  temperature: number;
  maxTokens: number;
}

export const AI_PROVIDERS: AIProvider[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'GPT models from OpenAI - Most popular and reliable',
    icon: '🤖',
    requiresApiKey: true,
    models: [
      {
        id: 'gpt-3.5-turbo',
        name: 'GPT-3.5 Turbo',
        description: 'Fast and cost-effective',
        maxTokens: 4096,
        costPer1kTokens: 0.002
      },
      {
        id: 'gpt-4',
        name: 'GPT-4',
        description: 'Most capable model',
        maxTokens: 8192,
        costPer1kTokens: 0.03
      },
      {
        id: 'gpt-4-turbo',
        name: 'GPT-4 Turbo',
        description: 'Latest and most efficient GPT-4',
        maxTokens: 128000,
        costPer1kTokens: 0.01
      }
    ]
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    description: 'Claude models - Great for conversations and analysis',
    icon: '🧠',
    requiresApiKey: true,
    models: [
      {
        id: 'claude-3-haiku-20240307',
        name: 'Claude 3 Haiku',
        description: 'Fast and efficient',
        maxTokens: 200000,
        costPer1kTokens: 0.00025
      },
      {
        id: 'claude-3-sonnet-20240229',
        name: 'Claude 3 Sonnet',
        description: 'Balanced performance',
        maxTokens: 200000,
        costPer1kTokens: 0.003
      },
      {
        id: 'claude-3-opus-20240229',
        name: 'Claude 3 Opus',
        description: 'Most capable Claude model',
        maxTokens: 200000,
        costPer1kTokens: 0.015
      }
    ]
  },
  {
    id: 'google',
    name: 'Google Gemini',
    description: 'Gemini models - Multimodal AI from Google',
    icon: '💎',
    requiresApiKey: true,
    models: [
      {
        id: 'gemini-pro',
        name: 'Gemini Pro',
        description: 'Best for text tasks',
        maxTokens: 32768,
        costPer1kTokens: 0.0005
      },
      {
        id: 'gemini-pro-vision',
        name: 'Gemini Pro Vision',
        description: 'Multimodal capabilities',
        maxTokens: 16384,
        costPer1kTokens: 0.0025
      }
    ]
  },
  {
    id: 'custom',
    name: 'Custom Endpoint',
    description: 'Use your own API endpoint or local models like Ollama',
    icon: '⚙️',
    requiresApiKey: false,
    models: [
      {
        id: 'custom-model',
        name: 'Custom Model',
        description: 'Your custom model configuration',
        maxTokens: 4096
      }
    ]
  }
];

export const DEFAULT_AI_CONFIG: AIConfig = {
  provider: 'openai',
  model: 'gpt-3.5-turbo',
  apiKey: '',
  temperature: 0.7,
  maxTokens: 500
};