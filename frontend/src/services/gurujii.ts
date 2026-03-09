/**
 * Gurujii Service
 * Frontend service to interact with Gurujii API
 */

const GURUJII_API_URL = import.meta.env.VITE_GURUJII_API_URL || 'http://localhost:5000';

export interface GurujiRequest {
  code: string;
  message: string;
  language?: string;
}

export interface GurujiResponse {
  explanation: string;
  hasError: boolean;
  errorType?: string;
  voiceUrl?: string;
  detectedLanguage: string;
}

export class GurujiService {
  /**
   * Analyze code and get explanation from Gurujii
   */
  static async analyzeCode(data: GurujiRequest): Promise<GurujiResponse> {
    try {
      const response = await fetch(`${GURUJII_API_URL}/api/gurujii/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Gurujii API Error:', error);
      
      // Fallback response
      return {
        explanation: 'Gurujii is currently unavailable. Please check your code syntax and try again.',
        hasError: false,
        detectedLanguage: data.language || 'en',
      };
    }
  }

  /**
   * Get error explanation from Gurujii
   */
  static async explainError(code: string, error: string, language: string = 'en'): Promise<GurujiResponse> {
    try {
      const response = await fetch(`${GURUJII_API_URL}/api/gurujii/explain-error`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, error, language }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      console.error('Gurujii Error Explanation Failed:', err);
      
      return {
        explanation: 'Unable to explain the error at this moment.',
        hasError: true,
        detectedLanguage: language,
      };
    }
  }

  /**
   * Get code suggestions from Gurujii
   */
  static async getSuggestions(code: string, context: string, language: string = 'en'): Promise<string> {
    try {
      const response = await fetch(`${GURUJII_API_URL}/api/gurujii/suggest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, context, language }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return data.suggestion;
    } catch (error) {
      console.error('Gurujii Suggestions Failed:', error);
      return 'Unable to provide suggestions at this moment.';
    }
  }

  /**
   * Check if Gurujii API is available
   */
  static async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${GURUJII_API_URL}/health`, {
        method: 'GET',
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Play voice explanation
   */
  static playVoice(voiceUrl: string): void {
    if (!voiceUrl) return;
    
    const audio = new Audio(`${GURUJII_API_URL}${voiceUrl}`);
    audio.play().catch(err => {
      console.error('Failed to play voice:', err);
    });
  }
}
