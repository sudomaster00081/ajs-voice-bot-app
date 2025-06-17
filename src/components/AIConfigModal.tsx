import React, { useState } from 'react';
import { X, Settings, Brain, Key, Globe, Zap, DollarSign, Info } from 'lucide-react';
import { AIConfig, AI_PROVIDERS, DEFAULT_AI_CONFIG } from '../types/ai-providers';

interface AIConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (config: AIConfig) => void;
  currentConfig: AIConfig;
}

export function AIConfigModal({ isOpen, onClose, onSubmit, currentConfig }: AIConfigModalProps) {
  const [config, setConfig] = useState<AIConfig>(currentConfig);
  const [showAdvanced, setShowAdvanced] = useState(false);

  if (!isOpen) return null;

  const selectedProvider = AI_PROVIDERS.find(p => p.id === config.provider);
  const selectedModel = selectedProvider?.models.find(m => m.id === config.model);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(config);
  };

  const handleProviderChange = (providerId: string) => {
    const provider = AI_PROVIDERS.find(p => p.id === providerId);
    if (provider) {
      setConfig({
        ...config,
        provider: providerId,
        model: provider.models[0].id,
        maxTokens: provider.models[0].maxTokens > 1000 ? 500 : provider.models[0].maxTokens,
        customModel: providerId === 'custom' ? (config.customModel || 'llama2') : undefined,
      });
    }
  };

  const handleModelChange = (modelId: string) => {
    const model = selectedProvider?.models.find(m => m.id === modelId);
    if (model) {
      setConfig({
        ...config,
        model: modelId,
        maxTokens: model.maxTokens > 1000 ? 500 : model.maxTokens,
      });
    }
  };

  const resetToDefaults = () => {
    setConfig(DEFAULT_AI_CONFIG);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-emerald-200/50">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              AI Configuration
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-2xl p-4 mb-6">
          <div className="flex items-start space-x-3">
            <Brain className="w-6 h-6 text-emerald-600 mt-1 flex-shrink-0" />
            <div>
              <p className="text-sm text-emerald-800 font-medium mb-1">
                Choose your AI provider to customize how I respond to you!
              </p>
              <p className="text-xs text-emerald-700">
                Each provider has different strengths - pick what works best for you. 🚀
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Provider Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              AI Provider
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {AI_PROVIDERS.map((provider) => (
                <button
                  key={provider.id}
                  type="button"
                  onClick={() => handleProviderChange(provider.id)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
                    config.provider === provider.id
                      ? 'border-emerald-500 bg-emerald-50 shadow-lg'
                      : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50'
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-2xl">{provider.icon}</span>
                    <span className="font-semibold text-gray-900">{provider.name}</span>
                  </div>
                  <p className="text-xs text-gray-600">{provider.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Model Selection */}
          {selectedProvider && config.provider !== 'custom' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Model
              </label>
              <select
                value={config.model}
                onChange={(e) => handleModelChange(e.target.value)}
                className="w-full px-4 py-3 border-2 border-emerald-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 bg-white/80 backdrop-blur-sm"
              >
                {selectedProvider.models.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name} - {model.description}
                  </option>
                ))}
              </select>
              {selectedModel?.costPer1kTokens && (
                <div className="mt-2 flex items-center space-x-2 text-xs text-gray-600">
                  <DollarSign className="w-3 h-3" />
                  <span>~${selectedModel.costPer1kTokens}/1K tokens</span>
                </div>
              )}
            </div>
          )}

          {/* Custom Model Name for Custom Endpoints */}
          {config.provider === 'custom' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Model Name
              </label>
              <input
                type="text"
                value={config.customModel || ''}
                onChange={(e) => setConfig({ ...config, customModel: e.target.value })}
                placeholder="e.g., llama2, codellama, mistral, phi3, etc."
                className="w-full px-4 py-3 border-2 border-emerald-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 bg-white/80 backdrop-blur-sm"
                required
              />
              <p className="text-xs text-gray-600 mt-2">
                Enter the exact model name as expected by your endpoint (e.g., "llama2" for Ollama)
              </p>
            </div>
          )}

          {/* API Key */}
          {selectedProvider?.requiresApiKey && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                API Key
              </label>
              <input
                type="password"
                value={config.apiKey}
                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                placeholder={`Enter your ${selectedProvider.name} API key...`}
                className="w-full px-4 py-3 border-2 border-emerald-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 bg-white/80 backdrop-blur-sm"
                required
              />
            </div>
          )}

          {/* Custom Endpoint */}
          {config.provider === 'custom' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Custom Endpoint
              </label>
              <input
                type="url"
                value={config.customEndpoint || ''}
                onChange={(e) => setConfig({ ...config, customEndpoint: e.target.value })}
                placeholder="http://localhost:11434/api/generate"
                className="w-full px-4 py-3 border-2 border-emerald-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 bg-white/80 backdrop-blur-sm"
              />
              <p className="text-xs text-gray-600 mt-2">
                For local models like Ollama, or your own API endpoint
              </p>
            </div>
          )}

          {/* Optional API Key for Custom Endpoints */}
          {config.provider === 'custom' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                API Key (Optional)
              </label>
              <input
                type="password"
                value={config.apiKey}
                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                placeholder="Enter API key if required by your endpoint..."
                className="w-full px-4 py-3 border-2 border-emerald-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 bg-white/80 backdrop-blur-sm"
              />
              <p className="text-xs text-gray-600 mt-2">
                Leave empty if your custom endpoint doesn't require authentication
              </p>
            </div>
          )}

          {/* Advanced Settings */}
          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center space-x-2 text-sm font-semibold text-emerald-600 hover:text-emerald-800 transition-colors duration-200"
            >
              <Zap className="w-4 h-4" />
              <span>Advanced Settings</span>
            </button>
            
            {showAdvanced && (
              <div className="mt-4 space-y-4 p-4 bg-gray-50 rounded-2xl border border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Temperature: {config.temperature}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={config.temperature}
                    onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>More focused</span>
                    <span>More creative</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Tokens: {config.maxTokens}
                  </label>
                  <input
                    type="range"
                    min="100"
                    max={selectedModel?.maxTokens || 4096}
                    step="50"
                    value={config.maxTokens}
                    onChange={(e) => setConfig({ ...config, maxTokens: parseInt(e.target.value) })}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Shorter responses</span>
                    <span>Longer responses</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Provider Info */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-4">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-blue-800 font-medium mb-2">
                  {config.provider === 'custom' ? 'Custom Endpoint Setup' : 'Need API keys?'}
                </p>
                {config.provider === 'custom' ? (
                  <div className="space-y-1 text-xs text-blue-700">
                    <div>• For Ollama: Use <code className="bg-blue-100 px-1 rounded">http://localhost:11434/api/generate</code></div>
                    <div>• Model name should match your installed model (e.g., "llama2", "codellama")</div>
                    <div>• Most local models don't require API keys</div>
                  </div>
                ) : (
                  <div className="space-y-1 text-xs text-blue-700">
                    <div>• <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-900">OpenAI API Keys</a></div>
                    <div>• <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-900">Anthropic Console</a></div>
                    <div>• <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-900">Google AI Studio</a></div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={resetToDefaults}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-semibold"
            >
              Reset to Defaults
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Save Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}