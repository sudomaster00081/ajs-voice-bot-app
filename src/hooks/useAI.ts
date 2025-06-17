import { useState } from 'react';
import { AIConfig, AI_PROVIDERS } from '../types/ai-providers';

const SYSTEM_PROMPT = `You are Ajay Prasad P K, an AI professional from Calicut, Kerala, India. You have a Master's degree in Computer Science with specialization in Artificial Intelligence from Kerala University (2022-2024) and a Bachelor's degree in Computer Science from Calicut University (2019-2022).

Personal Background:
- You live at Padinhara Kothangal House, Calicut, Kerala- 673601
- Email: ajayprasad008@gmail.com, Phone: +91 6282687762
- LinkedIn: linkedin.com/in/ajayprasadpk, GitHub: github.com/sudomaster00081
- You're passionate about AI, machine learning, and creating innovative data-driven solutions
- You speak English fluently, Malayalam natively, and Hindi conversationally
- You're interested in open source contributions, AI research, network security, and automotive tech

Professional Experience:
- AI/Software Development Intern at Kameda Infologics, Technopark, Trivandrum (Jan 2024–Jun 2024)
- Developed RESTful APIs using Flask and Django, improving response times by 30%
- Integrated Azure AI services and optimized OpenAI prompt templates
- Implemented CI/CD pipelines using GitHub Actions

Technical Skills:
- Languages: Python, JavaScript/TypeScript, SQL, Bash
- Frameworks: Django, Flask, Angular, NgRx
- AI/ML: Supervised Learning, Neural Networks, Scikit-learn, TensorFlow, Azure AI
- DevOps: Git, Docker, CI/CD, Azure DevOps
- Networking: Scapy, Mininet, Ryu SDN Controller, Wireshark

Key Projects:
- Real-time DDoS Detection System using Self-Organizing Maps (92% accuracy)
- ExamWizard2022 - Online Examination System using Django

Achievements:
- UGC-NET Qualified in Computer Science (Top 6%)
- Supervised Machine Learning certification from DeepLearning.AI & Stanford
- Mentor at Xplora-WINHACK2023 (Women Hackathon by ICFOSS)

Respond as Ajay would in a conversational, friendly manner. Share personal insights about your journey from Kerala, your passion for AI, your experiences at Technopark, and your aspirations. Be authentic and reflect your technical expertise while maintaining a warm, approachable personality. You can use occasional Malayalam words naturally (like "നമസ്കാരം" for hello) when appropriate.`;

export function useAI(config: AIConfig) {
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (message: string): Promise<string> => {
    if (!config.apiKey && config.provider !== 'custom') {
      throw new Error('API key is required');
    }

    setIsLoading(true);
    
    try {
      let response: Response;
      
      switch (config.provider) {
        case 'openai':
          response = await sendOpenAIMessage(message, config);
          break;
        case 'anthropic':
          response = await sendClaudeMessage(message, config);
          break;
        case 'google':
          response = await sendGeminiMessage(message, config);
          break;
        case 'custom':
          response = await sendCustomMessage(message, config);
          break;
        default:
          throw new Error(`Unsupported provider: ${config.provider}`);
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      return extractResponseText(data, config.provider);
    } catch (error) {
      console.error('AI API error:', error);
      
      // Handle specific error types with user-friendly messages
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error(`Connection failed. This usually happens because:\n\n• CORS policy blocks direct browser requests to ${getProviderName(config.provider)} API\n• Your internet connection is unstable\n• The API endpoint is unreachable\n\nFor ${getProviderName(config.provider)}, you'll need to use a backend server or proxy to make API calls. Consider using the Custom Endpoint option with a local AI model like Ollama instead.`);
      }
      
      if (error instanceof Error) {
        throw error;
      }
      
      throw new Error('An unexpected error occurred while connecting to the AI service.');
    } finally {
      setIsLoading(false);
    }
  };

  return { sendMessage, isLoading };
}

function getProviderName(provider: string): string {
  const providerMap: { [key: string]: string } = {
    'openai': 'OpenAI',
    'anthropic': 'Anthropic Claude',
    'google': 'Google Gemini',
    'custom': 'Custom Endpoint'
  };
  return providerMap[provider] || provider;
}

async function sendOpenAIMessage(message: string, config: AIConfig): Promise<Response> {
  return fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: message }
      ],
      max_tokens: config.maxTokens,
      temperature: config.temperature,
    }),
  });
}

async function sendClaudeMessage(message: string, config: AIConfig): Promise<Response> {
  return fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: config.maxTokens,
      temperature: config.temperature,
      system: SYSTEM_PROMPT,
      messages: [
        { role: 'user', content: message }
      ],
    }),
  });
}

async function sendGeminiMessage(message: string, config: AIConfig): Promise<Response> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${config.apiKey}`;
  
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: `${SYSTEM_PROMPT}\n\nUser: ${message}` }
          ]
        }
      ],
      generationConfig: {
        temperature: config.temperature,
        maxOutputTokens: config.maxTokens,
      },
    }),
  });
}

async function sendCustomMessage(message: string, config: AIConfig): Promise<Response> {
  const endpoint = config.customEndpoint || 'http://localhost:11434/api/generate';
  const modelName = config.customModel || 'llama2';
  
  return fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(config.apiKey && { 'Authorization': `Bearer ${config.apiKey}` }),
    },
    body: JSON.stringify({
      model: modelName,
      prompt: `${SYSTEM_PROMPT}\n\nUser: ${message}\nAjay:`,
      stream: false,
      options: {
        temperature: config.temperature,
        num_predict: config.maxTokens,
      },
    }),
  });
}

function extractResponseText(data: any, provider: string): string {
  switch (provider) {
    case 'openai':
      return data.choices?.[0]?.message?.content || 'Sorry, I couldn\'t generate a response.';
    case 'anthropic':
      return data.content?.[0]?.text || 'Sorry, I couldn\'t generate a response.';
    case 'google':
      return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I couldn\'t generate a response.';
    case 'custom':
      return data.response || data.text || data.content || 'Sorry, I couldn\'t generate a response.';
    default:
      return 'Sorry, I couldn\'t generate a response.';
  }
}