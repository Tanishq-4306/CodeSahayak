import { Router } from 'express';
import { GurujiService } from '../services/gurujii';
import { authenticateToken } from '../middleware/auth';

const router = Router();

/**
 * POST /api/gurujii/analyze
 * Analyze code and provide explanation
 */
router.post('/analyze', authenticateToken, async (req, res) => {
  try {
    const { code, message, language } = req.body;

    if (!code || !message) {
      return res.status(400).json({
        error: 'Code and message are required',
      });
    }

    const result = await GurujiService.analyzeCode({
      code,
      message,
      language: language || 'en',
    });

    res.json(result);
  } catch (error) {
    console.error('Gurujii analyze error:', error);
    res.status(500).json({
      error: 'Failed to analyze code',
    });
  }
});

/**
 * POST /api/gurujii/explain-error
 * Explain a specific error
 */
router.post('/explain-error', authenticateToken, async (req, res) => {
  try {
    const { code, error, language } = req.body;

    if (!code || !error) {
      return res.status(400).json({
        error: 'Code and error are required',
      });
    }

    const result = await GurujiService.explainError(code, error, language || 'en');

    res.json(result);
  } catch (err) {
    console.error('Gurujii explain error:', err);
    res.status(500).json({
      error: 'Failed to explain error',
    });
  }
});

/**
 * POST /api/gurujii/suggest
 * Get code suggestions
 */
router.post('/suggest', authenticateToken, async (req, res) => {
  try {
    const { code, context, language } = req.body;

    if (!code) {
      return res.status(400).json({
        error: 'Code is required',
      });
    }

    const suggestion = await GurujiService.getSuggestions(
      code,
      context || '',
      language || 'en'
    );

    res.json({ suggestion });
  } catch (error) {
    console.error('Gurujii suggest error:', error);
    res.status(500).json({
      error: 'Failed to get suggestions',
    });
  }
});

/**
 * GET /api/gurujii/health
 * Check Gurujii service health
 */
router.get('/health', async (req, res) => {
  try {
    const isHealthy = await GurujiService.healthCheck();
    
    res.json({
      status: isHealthy ? 'healthy' : 'unavailable',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
