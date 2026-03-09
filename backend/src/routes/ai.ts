import { Router } from 'express';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '../middleware/auth.js';

const router = Router();

// Mock AI service - in production, this would call a real LLM API
const generateExplanation = async (params: {
  code: string;
  error?: string;
  language: string;
  userLanguage: string;
  concept?: string;
}): Promise<string> => {
  const { code, error, userLanguage, concept } = params;
  
  // This is a mock implementation
  // In production, this would call your quantized LLM (e.g., Llama 3.1 8B 4-bit)
  
  const explanations: Record<string, Record<string, string>> = {
    en: {
      loop: "Think of a loop like making multiple cups of chai. You repeat the same steps (add tea, add milk, add sugar) for each cup until you've made enough.",
      array: "An array is like a row of cups on a tray. Each cup has a number (index), and you can access any cup by its number.",
      function: "A function is like a recipe card. You write the steps once, and whenever you need those steps, you just call the recipe by name.",
      error: `I see an error in your code. ${error ? `The error says: "${error}". ` : ''}Let's break it down step by step...`,
      default: "Let me explain this code to you. It looks like you're trying to solve a programming problem. Here's what's happening...",
    },
    hi: {
      loop: "लूप को कई कप चाय बनाने की तरह सोचें। आप प्रत्येक कप के लिए समान चरण दोहराते हैं (चाय डालें, दूध डालें, चीनी डालें) जब तक कि पर्याप्त न बन जाए।",
      array: "एरे ट्रे पर कप की एक पंक्ति की तरह है। प्रत्येक कप का एक नंबर (इंडेक्स) होता है, और आप किसी भी कप को उसके नंबर से एक्सेस कर सकते हैं।",
      function: "फ़ंक्शन एक रेसिपी कार्ड की तरह है। आप चरण एक बार लिखते हैं, और जब भी आपको उन चरणों की आवश्यकता होती है, तो आप बस रेसिपी को नाम से कॉल करते हैं।",
      error: `मुझे आपके कोड में एक त्रुटि दिख रही है। ${error ? `त्रुटि कहती है: "${error}"। ` : ''}आइए इसे चरण दर चरण समझें...`,
      default: "मुझे आपको यह कोड समझाने दें। ऐसा लगता है कि आप एक प्रोग्रामिंग समस्या हल करने की कोशिश कर रहे हैं। यहाँ क्या हो रहा है...",
    },
    ta: {
      loop: "லூப்பை பல கோப்பைகள் தேநீர் செய்வது போல சிந்தியுங்கள். ஒவ்வொரு கோப்பைக்கும் ஒரே படிகளை (தேநீர் சேர்க்க, பால் சேர்க்க, சர்க்கரை சேர்க்க) மீண்டும் செய்கிறீர்கள்.",
      array: "அரை டிரேயில் கோப்பைகளின் வரிசை போல். ஒவ்வொரு கோப்பைக்கும் ஒரு எண் (இன்டெக்ஸ்) உள்ளது.",
      function: "செயல்பாடு ஒரு சமையல் அட்டை போல். நீங்கள் படிகளை ஒருமுறை எழுதுகிறீர்கள், பின்னர் அதை பெயரால் அழைக்கிறீர்கள்.",
      error: `உங்கள் குறியீட்டில் பிழை உள்ளது. ${error ? `பிழை கூறுகிறது: "${error}"। ` : ''}படிப்படியாக புரிந்துகொள்வோம்...`,
      default: "இந்த குறியீட்டை விளக்குகிறேன். நீங்கள் ஒரு நிரலாக்க சிக்கலை தீர்க்க முயற்சிக்கிறீர்கள் போல்...",
    },
  };

  const langExplanations = explanations[userLanguage] || explanations.en;
  return langExplanations[concept || 'default'] || langExplanations.default;
};

const generateHint = async (params: {
  code: string;
  error?: string;
  attempt: number;
  userLanguage: string;
}): Promise<string> => {
  const { error, attempt, userLanguage } = params;
  
  const hints: Record<string, string[]> = {
    en: [
      "Take a closer look at the line numbers mentioned in the error. What could be wrong there?",
      "Think about the data types. Are you trying to use a number where a string is expected?",
      "Check your loop conditions. Does your loop have a proper exit condition?",
      "Look at variable names. Are you using the right variable in the right place?",
    ],
    hi: [
      "त्रुटि में उल्लिखित लाइन नंबरों को ध्यान से देखें। वहाँ क्या गलत हो सकता है?",
      "डेटा प्रकारों के बारे में सोचें। क्या आप एक स्ट्रिंग की अपेक्षा के स्थान पर एक नंबर का उपयोग करने की कोशिश कर रहे हैं?",
      "अपनी लूप शर्तों की जाँच करें। क्या आपके लूप में एक उचित एग्जिट शर्त है?",
      "चर नाम देखें। क्या आप सही जगह पर सही चर का उपयोग कर रहे हैं?",
    ],
    ta: [
      "பிழையில் குறிப்பிடப்பட்ட வரி எண்களை கவனமாகப் பாருங்கள். அங்கே என்ன தவறு இருக்க முடியும்?",
      "தரவு வகைகளைப் பற்றி சிந்தியுங்கள். நீங்கள் எண்ணைப் பயன்படுத்த முயற்சிக்கிறீர்களா?",
      "உங்கள் லூப் நிபந்தனைகளை சரிபார்க்கவும். உங்கள் லூப்பிற்கு சரியான வெளியேறும் நிபந்தனை உள்ளதா?",
      "மாறி பெயர்களைப் பாருங்கள். சரியான இடத்தில் சரியான மாறியைப் பயன்படுத்துகிறீர்களா?",
    ],
  };

  const langHints = hints[userLanguage] || hints.en;
  return langHints[Math.min(attempt - 1, langHints.length - 1)];
};

// POST /api/ai/explain - Get AI explanation for code
router.post('/explain', authenticate, async (req: AuthRequest, res) => {
  try {
    const schema = z.object({
      code: z.string(),
      error: z.string().optional(),
      language: z.string().default('python'),
      userLanguage: z.string().default('en'),
      concept: z.string().optional(),
    });

    const data = schema.parse(req.body);

    // In production, this would call your quantized LLM
    const explanation = await generateExplanation(data);

    res.json({
      explanation,
      type: data.error ? 'error' : 'general',
      language: data.userLanguage,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation error', details: error.errors });
      return;
    }
    console.error('AI explain error:', error);
    res.status(500).json({ error: 'Failed to generate explanation' });
  }
});

// POST /api/ai/hint - Get progressive hint
router.post('/hint', authenticate, async (req: AuthRequest, res) => {
  try {
    const schema = z.object({
      code: z.string(),
      error: z.string().optional(),
      attempt: z.number().min(1).default(1),
      userLanguage: z.string().default('en'),
    });

    const data = schema.parse(req.body);

    // Generate progressive hint
    const hint = await generateHint(data);

    res.json({
      hint,
      attempt: data.attempt,
      maxAttempts: 4,
      language: data.userLanguage,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation error', details: error.errors });
      return;
    }
    console.error('AI hint error:', error);
    res.status(500).json({ error: 'Failed to generate hint' });
  }
});

// POST /api/ai/debug - Get debug help
router.post('/debug', authenticate, async (req: AuthRequest, res) => {
  try {
    const schema = z.object({
      code: z.string(),
      error: z.string(),
      language: z.string().default('python'),
      userLanguage: z.string().default('en'),
      step: z.number().min(1).max(3).default(1),
    });

    const { code, error, userLanguage, step } = schema.parse(req.body);

    // Progressive debugging steps
    const steps: Record<number, { title: string; content: string }> = {
      1: {
        title: "What's wrong here?",
        content: `I see an error in your code. The error says: "${error}". This usually happens when...`,
      },
      2: {
        title: "Why does this happen?",
        content: "This error occurs because the code is trying to access something that doesn't exist. Think of it like asking for the 6th cup of chai when only 5 were made.",
      },
      3: {
        title: "Now you fix it",
        content: "Look at the line number in the error. Check if you're using the correct index or if the variable has the value you expect.",
      },
    };

    const stepData = steps[step];

    res.json({
      step,
      title: stepData.title,
      explanation: stepData.content,
      language: userLanguage,
      isLastStep: step === 3,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation error', details: error.errors });
      return;
    }
    console.error('AI debug error:', error);
    res.status(500).json({ error: 'Failed to generate debug help' });
  }
});

// POST /api/ai/quiz - Generate quiz question
router.post('/quiz', authenticate, async (req: AuthRequest, res) => {
  try {
    const schema = z.object({
      concept: z.string(),
      difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).default('MEDIUM'),
      userLanguage: z.string().default('en'),
    });

    const { concept, difficulty, userLanguage } = schema.parse(req.body);

    // Mock quiz generation - in production, use LLM
    const quizzes: Record<string, Record<string, any>> = {
      loop: {
        question: "What will be the output of this loop?\n\nfor i in range(3):\n    print(i)",
        options: ["0 1 2", "1 2 3", "0 1 2 3", "Error"],
        correct: 0,
        explanation: "range(3) generates numbers from 0 to 2 (3 is exclusive).",
      },
      array: {
        question: "What is the index of the last element in an array of size 5?",
        options: ["4", "5", "0", "Depends on the language"],
        correct: 0,
        explanation: "Arrays are 0-indexed, so the last element is at index 4 (size - 1).",
      },
    };

    const quiz = quizzes[concept] || {
      question: `Test your knowledge of ${concept}`,
      options: ["Option A", "Option B", "Option C", "Option D"],
      correct: 0,
      explanation: "This is a sample explanation.",
    };

    res.json({
      ...quiz,
      concept,
      difficulty,
      language: userLanguage,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation error', details: error.errors });
      return;
    }
    console.error('AI quiz error:', error);
    res.status(500).json({ error: 'Failed to generate quiz' });
  }
});

export default router;
