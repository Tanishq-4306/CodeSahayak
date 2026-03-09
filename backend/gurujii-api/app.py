#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Gurujii API Server
A friendly Indian coding teacher that explains Python errors in multiple languages
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import traceback
import torch
from langdetect import detect
from transformers import (
    pipeline,
    AutoTokenizer,
    AutoModelForSeq2SeqLM,
    VitsModel
)
import soundfile as sf
import os
from datetime import datetime

# Import teaching engine features
try:
    from teaching_engine import (
        OFFLINE_ERROR_DB,
        generate_hints,
        detect_concepts,
        explain_logic_step_by_step,
        visualize_execution,
        generate_practice_problems,
        explain_thinking_process,
        get_curriculum_content
    )
    TEACHING_ENGINE_AVAILABLE = True
except ImportError:
    TEACHING_ENGINE_AVAILABLE = False
    print("Warning: Teaching engine not available")
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend requests

# Global model variables
generator = None
translator_tokenizer = None
translator_model = None
tts_model = None
tts_tokenizer = None

# Language codes mapping
LANGUAGE_CODES = {
    "en": "eng_Latn",
    "hi": "hin_Deva",
    "ta": "tam_Taml",
    "bn": "ben_Beng",
    "te": "tel_Telu",
    "mr": "mar_Deva",
    "gu": "guj_Gujr",
    "kn": "kan_Knda",
    "ml": "mal_Mlym"
}

# Error database with multilingual messages
ERROR_DB = {
    "IndentationError": {
        "en": "Indentation is incorrect in the code. Python requires consistent spacing.",
        "hi": "Python में indentation सही नहीं है। Python को consistent spacing चाहिए।",
        "ta": "Python-இல் indentation தவறாக உள்ளது. Python க்கு consistent spacing தேவை.",
        "bn": "Python এ indentation ভুল হয়েছে। Python এ consistent spacing প্রয়োজন।"
    },
    "SyntaxError": {
        "en": "There is a syntax mistake in the code. Check for missing colons, brackets, or quotes.",
        "hi": "Code में syntax की गलती है। Missing colons, brackets या quotes check करें।",
        "ta": "Code syntax தவறாக உள்ளது. Missing colons, brackets அல்லது quotes சரிபார்க்கவும்.",
        "bn": "Code এ syntax ভুল আছে। Missing colons, brackets বা quotes চেক করুন।"
    },
    "NameError": {
        "en": "A variable or function name is not defined. Make sure you've declared it before using.",
        "hi": "Variable या function का नाम define नहीं है। Use करने से पहले declare करें।",
        "ta": "Variable அல்லது function பெயர் வரையறுக்கப்படவில்லை. பயன்படுத்தும் முன் அறிவிக்கவும்.",
        "bn": "Variable বা function এর নাম define করা নেই। ব্যবহারের আগে declare করুন।"
    },
    "TypeError": {
        "en": "You're using the wrong data type. Check if you're mixing strings, numbers, or lists incorrectly.",
        "hi": "Wrong data type use हो रहा है। Strings, numbers या lists को गलत तरीके से mix कर रहे हैं।",
        "ta": "தவறான data type பயன்படுத்துகிறீர்கள். Strings, numbers அல்லது lists தவறாக கலக்கப்பட்டுள்ளதா என சரிபார்க்கவும்.",
        "bn": "ভুল data type ব্যবহার করছেন। Strings, numbers বা lists ভুলভাবে mix করছেন কিনা চেক করুন।"
    },
    "ValueError": {
        "en": "The value you're using is not appropriate for this operation.",
        "hi": "आप जो value use कर रहे हैं वह इस operation के लिए appropriate नहीं है।",
        "ta": "நீங்கள் பயன்படுத்தும் value இந்த operation க்கு பொருத்தமானது அல்ல.",
        "bn": "আপনি যে value ব্যবহার করছেন তা এই operation এর জন্য উপযুক্ত নয়।"
    }
}

def load_models():
    """Load all AI models on startup"""
    global generator, translator_tokenizer, translator_model, tts_model, tts_tokenizer
    
    print("Loading Gurujii models...")
    
    try:
        # Load LLM for code explanation
        generator = pipeline(
            "text-generation",
            model="TinyLlama/TinyLlama-1.1B-Chat-v1.0",
            device=0 if torch.cuda.is_available() else -1
        )
        print("✓ Gurujii LLM loaded")
        
        # Load translator
        translator_name = "facebook/nllb-200-distilled-600M"
        translator_tokenizer = AutoTokenizer.from_pretrained(translator_name)
        translator_model = AutoModelForSeq2SeqLM.from_pretrained(translator_name)
        print("✓ Translator loaded")
        
        # Load TTS model (Hindi by default)
        tts_model = VitsModel.from_pretrained("facebook/mms-tts-hin")
        tts_tokenizer = AutoTokenizer.from_pretrained("facebook/mms-tts-hin")
        print("✓ Voice model loaded")
        
        print("All models loaded successfully!")
        return True
    except Exception as e:
        print(f"Error loading models: {e}")
        return False

def detect_language(text):
    """Detect the language of input text"""
    try:
        lang = detect(text)
        if lang not in LANGUAGE_CODES:
            lang = "en"
        return lang
    except:
        return "en"

def translate_text(text, target_lang):
    """Translate text to target language"""
    if target_lang == "en" or translator_model is None:
        return text
    
    try:
        tgt = LANGUAGE_CODES.get(target_lang, "eng_Latn")
        inputs = translator_tokenizer(text, return_tensors="pt", max_length=512, truncation=True)
        
        tokens = translator_model.generate(
            **inputs,
            forced_bos_token_id=translator_tokenizer.lang_code_to_id[tgt],
            max_length=200
        )
        
        output = translator_tokenizer.batch_decode(tokens, skip_special_tokens=True)
        return output[0]
    except Exception as e:
        print(f"Translation error: {e}")
        return text

def execute_python_code(code):
    """Execute Python code and capture output and errors"""
    import sys
    from io import StringIO
    
    # Create string buffers to capture output
    stdout_buffer = StringIO()
    stderr_buffer = StringIO()
    
    # Save original stdout/stderr
    old_stdout = sys.stdout
    old_stderr = sys.stderr
    
    try:
        # Redirect stdout/stderr to buffers
        sys.stdout = stdout_buffer
        sys.stderr = stderr_buffer
        
        # Create a clean namespace for execution
        exec_globals = {
            '__builtins__': __builtins__,
            '__name__': '__main__',
        }
        
        # Compile and execute the code
        compiled_code = compile(code, '<string>', 'exec')
        exec(compiled_code, exec_globals)
        
        # Get the output
        output = stdout_buffer.getvalue()
        error_output = stderr_buffer.getvalue()
        
        # Restore original stdout/stderr
        sys.stdout = old_stdout
        sys.stderr = old_stderr
        
        return {
            'success': True,
            'output': output,
            'error': None,
            'error_type': None
        }
        
    except SyntaxError as e:
        # Restore original stdout/stderr
        sys.stdout = old_stdout
        sys.stderr = old_stderr
        
        return {
            'success': False,
            'output': stdout_buffer.getvalue(),
            'error': traceback.format_exc(),
            'error_type': 'SyntaxError',
            'error_message': f"{e.msg} (line {e.lineno})" if e.lineno else str(e.msg)
        }
        
    except Exception as e:
        # Restore original stdout/stderr
        sys.stdout = old_stdout
        sys.stderr = old_stderr
        
        # Get error details
        error_trace = traceback.format_exc()
        error_type = type(e).__name__
        error_message = str(e)
        
        return {
            'success': False,
            'output': stdout_buffer.getvalue(),
            'error': error_trace,
            'error_type': error_type,
            'error_message': error_message
        }

def generate_voice(text, language="hi"):
    """Generate voice output for the explanation"""
    if tts_model is None:
        return None
    
    try:
        # Clean and limit text
        text = text.replace("\n", " ").strip()
        text = text[:200]  # Limit to 200 characters
        
        inputs = tts_tokenizer(text, return_tensors="pt")
        
        with torch.no_grad():
            speech = tts_model(**inputs).waveform
        
        # Create audio directory if it doesn't exist
        os.makedirs("static/audio", exist_ok=True)
        
        # Generate unique filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"static/audio/gurujii_{timestamp}.wav"
        
        sf.write(filename, speech.squeeze().numpy(), tts_model.config.sampling_rate)
        
        return f"/audio/gurujii_{timestamp}.wav"
    except Exception as e:
        print(f"Voice generation error: {e}")
        return None

def gurujii_explain(code, message, user_language):
    """Main Gurujii engine - Enhanced with teaching features"""
    
    message_lower = message.lower()
    
    # Detect concepts in the code
    if TEACHING_ENGINE_AVAILABLE:
        concepts = detect_concepts(code, user_language)
    else:
        concepts = []
    
    # Determine the action based on the message
    is_explain_request = 'explain' in message_lower and 'detail' in message_lower
    is_hint_request = 'hint' in message_lower
    is_improve_request = 'improve' in message_lower or 'best practice' in message_lower
    is_debug_request = 'debug' in message_lower or 'error' in message_lower or 'find' in message_lower
    is_execute_request = 'execute' in message_lower or 'run' in message_lower
    
    # Handle EXPLAIN request - Don't execute, just analyze
    if is_explain_request:
        try:
            import ast
            tree = ast.parse(code)
            
            explanation = "📚 Code Explanation:\\n\\n"
            
            functions = [node.name for node in ast.walk(tree) if isinstance(node, ast.FunctionDef)]
            if functions:
                explanation += f"🔧 Functions defined: {', '.join(functions)}\\n"
            
            loops = len([node for node in ast.walk(tree) if isinstance(node, (ast.For, ast.While))])
            if loops:
                explanation += f"🔄 Contains {loops} loop(s)\\n"
            
            conditionals = len([node for node in ast.walk(tree) if isinstance(node, ast.If)])
            if conditionals:
                explanation += f"🔀 Contains {conditionals} conditional(s)\\n"
            
            # Count lines
            lines = len([l for l in code.split('\\n') if l.strip()])
            explanation += f"📝 Total lines: {lines}\\n"
            
            # Add concept detection
            if concepts:
                explanation += f"\\n🎯 Concepts detected:\\n"
                for concept in concepts:
                    explanation += f"   • {concept['concept']} ({concept['difficulty']})\\n"
                    explanation += f"     {concept['explanation'][:100]}...\\n"
            
            # Add logic explanation if available
            if TEACHING_ENGINE_AVAILABLE:
                logic = explain_logic_step_by_step(code, user_language)
                explanation += f"\\n{logic}"
            
            # Add visualization for recursion
            if TEACHING_ENGINE_AVAILABLE:
                viz = visualize_execution(code, user_language)
                if viz:
                    explanation += f"\\n\\n{viz}"
            
            explanation += "\\n\\n✨ To see the output, click the Run button in the terminal!"
            
            return {
                "explanation": explanation,
                "hasError": False,
                "concepts": concepts,
                "detectedLanguage": user_language
            }
        except Exception as e:
            return {
                "explanation": f"Unable to parse code: {str(e)}",
                "hasError": False,
                "detectedLanguage": user_language
            }
    
    # Handle HINT request - Provide hints without executing
    if is_hint_request:
        hints_text = "💡 Code Improvement Hints:\\n\\n"
        
        # Check for common improvements
        if "print" in code and "(" not in code:
            hints_text += "• Use parentheses with print() in Python 3\\n"
        
        if "def" in code and "return" not in code:
            hints_text += "• Consider adding a return statement to your function\\n"
        
        if "#" not in code and len(code.split('\\n')) > 5:
            hints_text += "• Add comments to explain complex logic\\n"
        
        triple_quote = chr(34) * 3
        single_triple = chr(39) * 3
        if triple_quote not in code and single_triple not in code and "def" in code:
            hints_text += "• Add docstrings to document your functions\\n"
        
        hints_text += "\\n🌟 General Best Practices:\\n"
        hints_text += "• Use meaningful variable names\\n"
        hints_text += "• Keep functions small and focused\\n"
        hints_text += "• Handle edge cases and errors\\n"
        hints_text += "• Write tests for your code\\n"
        
        return {
            "explanation": hints_text,
            "hasError": False,
            "detectedLanguage": user_language
        }
    
    # Handle IMPROVE request - Suggest improvements without executing
    if is_improve_request:
        improve_text = "✨ Code Improvement Suggestions:\\n\\n"
        
        try:
            import ast
            tree = ast.parse(code)
            
            functions = [node.name for node in ast.walk(tree) if isinstance(node, ast.FunctionDef)]
            
            improve_text += "📊 Current Analysis:\\n"
            improve_text += f"• Functions: {len(functions)}\\n"
            improve_text += f"• Lines of code: {len([l for l in code.split(chr(92)+'n') if l.strip()])}\\n\\n"
            
            improve_text += "🎯 Suggestions:\\n"
            
            triple_quote = chr(34) * 3
            single_triple = chr(39) * 3
            if not code.strip().startswith(triple_quote) and not code.strip().startswith(single_triple):
                improve_text += "1. Add a module docstring at the top\\n"
            
            if functions:
                improve_text += "2. Ensure all functions have docstrings\\n"
                improve_text += "3. Use type hints for parameters and return values\\n"
            
            improve_text += "4. Follow PEP 8 style guidelines\\n"
            improve_text += "5. Add error handling with try-except blocks\\n"
            improve_text += "6. Write unit tests for your functions\\n"
            
            improve_text += "\\n💡 Best Practices:\\n"
            improve_text += "• Use meaningful names (not x, y, z)\\n"
            improve_text += "• Keep functions under 20 lines\\n"
            improve_text += "• One function = one responsibility\\n"
            improve_text += "• Avoid global variables\\n"
            improve_text += "• Use constants for magic numbers\\n"
            
        except:
            improve_text += "• Review your code structure\\n"
            improve_text += "• Add comments and documentation\\n"
            improve_text += "• Follow Python best practices\\n"
        
        return {
            "explanation": improve_text,
            "hasError": False,
            "detectedLanguage": user_language
        }
    
    # Handle DEBUG request or execution - Check for errors
    execution_result = execute_python_code(code)
    
    if execution_result['success']:
        # Code executed successfully
        output = execution_result['output'].strip()
        
        if output:
            response = f"✓ Code executed successfully!\\n\\nOutput:\\n{output}"
        else:
            response = "✓ Code executed successfully! No output produced."
        
        response_translated = translate_text(response, user_language)
        
        return {
            "explanation": response_translated,
            "hasError": False,
            "output": output,
            "detectedLanguage": user_language
        }
    
    # Code has errors - Use teaching engine for better explanations
    error = execution_result['error']
    error_type = execution_result['error_type']
    error_message = execution_result['error_message']
    
    # Use offline error database if available
    if TEACHING_ENGINE_AVAILABLE and error_type in OFFLINE_ERROR_DB:
        error_info = OFFLINE_ERROR_DB[error_type].get(user_language, OFFLINE_ERROR_DB[error_type]["en"])
        
        # Generate hints
        hints = generate_hints(code, error_type, error_message, user_language)
        
        # Explain thinking process
        thinking = explain_thinking_process(code, error_type, user_language)
        
        response = f"""🐛 Error Detected: {error_type}

📍 {error_message}

{thinking}

💡 Understanding the Error:
{error_info['explanation']}

🎯 Three-Level Hints:
{chr(10).join(hints)}

🔧 How to Fix:
{error_info['fix']}

📚 Concept: {error_info['concept']}

💭 Ask "Why?" to understand this error deeply!"""
        
        voice_url = generate_voice(error_info['explanation'], user_language)
        
        return {
            "explanation": response,
            "hasError": True,
            "errorType": error_type,
            "errorMessage": error_message,
            "hints": hints,
            "concept": error_info['concept'],
            "voiceUrl": voice_url,
            "detectedLanguage": user_language
        }
    
    # Check if it's a known error type (fallback to original database)
    if error_type in ERROR_DB:
        base_message = ERROR_DB[error_type].get(user_language, ERROR_DB[error_type]["en"])
        
        # Add specific error details
        response = f"❌ {error_type}: {error_message}\\n\\n{base_message}"
        
        voice_url = generate_voice(base_message, user_language)
        
        return {
            "explanation": response,
            "hasError": True,
            "errorType": error_type,
            "errorMessage": error_message,
            "voiceUrl": voice_url,
            "detectedLanguage": user_language
        }
    
    # Use LLM for unknown errors
    if generator:
        prompt = f"""You are Gurujii, a friendly Indian coding teacher.
Explain this Python error in simple terms:

Error Type: {error_type}
Error Message: {error_message}

Provide a clear, beginner-friendly explanation in 2-3 sentences."""

        try:
            result = generator(prompt, max_new_tokens=150, do_sample=True, temperature=0.7)
            llm_response = result[0]["generated_text"]
            
            # Extract only the explanation part
            if "Provide a clear" in llm_response:
                llm_response = llm_response.split("Provide a clear")[0].strip()
            
            response = f"❌ {error_type}: {error_message}\\n\\n{llm_response}"
            response_translated = translate_text(response, user_language)
            voice_url = generate_voice(response_translated, user_language)
            
            return {
                "explanation": response_translated,
                "hasError": True,
                "errorType": error_type,
                "errorMessage": error_message,
                "voiceUrl": voice_url,
                "detectedLanguage": user_language
            }
        except Exception as e:
            print(f"LLM generation error: {e}")
    
    # Fallback response
    response = f"❌ {error_type}: {error_message}\\n\\nThere's an error in your code. Please check the syntax and try again."
    
    return {
        "explanation": response,
        "hasError": True,
        "errorType": error_type,
        "errorMessage": error_message,
        "detectedLanguage": user_language
    }

# API Routes

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "models_loaded": generator is not None
    })

@app.route('/api/gurujii/analyze', methods=['POST'])
def analyze_code():
    """Analyze code and provide explanation"""
    try:
        data = request.json
        code = data.get('code', '')
        message = data.get('message', '')
        language = data.get('language', 'en')
        
        if not code:
            return jsonify({"error": "Code is required"}), 400
        
        # Detect language from message if not provided
        if message and language == 'en':
            language = detect_language(message)
        
        result = gurujii_explain(code, message, language)
        
        return jsonify(result)
    
    except Exception as e:
        print(f"Analysis error: {e}")
        return jsonify({
            "error": "Failed to analyze code",
            "details": str(e)
        }), 500

@app.route('/api/gurujii/explain-error', methods=['POST'])
def explain_error():
    """Explain a specific error"""
    try:
        data = request.json
        code = data.get('code', '')
        error = data.get('error', '')
        language = data.get('language', 'en')
        
        if not code or not error:
            return jsonify({"error": "Code and error are required"}), 400
        
        # Use the error message directly
        for error_type, messages in ERROR_DB.items():
            if error_type in error:
                response = messages.get(language, messages["en"])
                voice_url = generate_voice(response, language)
                
                return jsonify({
                    "explanation": response,
                    "hasError": True,
                    "errorType": error_type,
                    "voiceUrl": voice_url,
                    "detectedLanguage": language
                })
        
        return jsonify({
            "explanation": "Unable to identify the specific error type.",
            "hasError": True,
            "detectedLanguage": language
        })
    
    except Exception as e:
        print(f"Error explanation failed: {e}")
        return jsonify({
            "error": "Failed to explain error",
            "details": str(e)
        }), 500

@app.route('/api/gurujii/suggest', methods=['POST'])
def get_suggestions():
    """Get code suggestions"""
    try:
        data = request.json
        code = data.get('code', '')
        context = data.get('context', '')
        language = data.get('language', 'en')
        
        if not code:
            return jsonify({"error": "Code is required"}), 400
        
        if generator:
            prompt = f"""As Gurujii, suggest improvements for this Python code:

Code:
{code}

Context: {context}

Provide helpful suggestions."""

            result = generator(prompt, max_new_tokens=100, do_sample=True, temperature=0.7)
            suggestion = result[0]["generated_text"]
            
            suggestion_translated = translate_text(suggestion, language)
            
            return jsonify({"suggestion": suggestion_translated})
        
        return jsonify({"suggestion": "Suggestions are currently unavailable."})
    
    except Exception as e:
        print(f"Suggestion error: {e}")
        return jsonify({
            "error": "Failed to generate suggestions",
            "details": str(e)
        }), 500

# ============================================================================
# ADVANCED TEACHING FEATURES
# ============================================================================

@app.route('/api/gurujii/hints', methods=['POST'])
def get_hints():
    """Get three-level hints instead of direct answers"""
    try:
        data = request.json
        code = data.get('code', '')
        error_type = data.get('errorType', '')
        error_message = data.get('errorMessage', '')
        language = data.get('language', 'en')
        
        if not TEACHING_ENGINE_AVAILABLE:
            return jsonify({"hints": ["Hint system not available"]})
        
        hints = generate_hints(code, error_type, error_message, language)
        
        return jsonify({
            "hints": hints,
            "message": "Try these hints before looking at the solution!"
        })
    
    except Exception as e:
        print(f"Hints error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/gurujii/detect-concepts', methods=['POST'])
def detect_code_concepts():
    """Automatically detect what concepts the student is learning"""
    try:
        data = request.json
        code = data.get('code', '')
        language = data.get('language', 'en')
        
        if not TEACHING_ENGINE_AVAILABLE:
            return jsonify({"concepts": []})
        
        concepts = detect_concepts(code, language)
        
        return jsonify({
            "concepts": concepts,
            "message": "Detected programming concepts in your code"
        })
    
    except Exception as e:
        print(f"Concept detection error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/gurujii/explain-logic', methods=['POST'])
def explain_code_logic():
    """Explain the logic and thinking process step by step"""
    try:
        data = request.json
        code = data.get('code', '')
        language = data.get('language', 'en')
        
        if not TEACHING_ENGINE_AVAILABLE:
            return jsonify({"explanation": "Logic explanation not available"})
        
        logic_explanation = explain_logic_step_by_step(code, language)
        
        return jsonify({
            "explanation": logic_explanation,
            "type": "logic"
        })
    
    except Exception as e:
        print(f"Logic explanation error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/gurujii/visualize', methods=['POST'])
def visualize_code_execution():
    """Create visual tree of code execution (especially recursion)"""
    try:
        data = request.json
        code = data.get('code', '')
        language = data.get('language', 'en')
        
        if not TEACHING_ENGINE_AVAILABLE:
            return jsonify({"visualization": None})
        
        visualization = visualize_execution(code, language)
        
        return jsonify({
            "visualization": visualization,
            "hasVisualization": visualization is not None
        })
    
    except Exception as e:
        print(f"Visualization error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/gurujii/practice', methods=['POST'])
def get_practice_problems():
    """Generate practice problems based on concept"""
    try:
        data = request.json
        concept = data.get('concept', 'loops')
        language = data.get('language', 'en')
        
        if not TEACHING_ENGINE_AVAILABLE:
            return jsonify({"problems": []})
        
        problems = generate_practice_problems(concept, language)
        
        return jsonify({
            "problems": problems,
            "concept": concept
        })
    
    except Exception as e:
        print(f"Practice generation error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/gurujii/explain-thinking', methods=['POST'])
def explain_student_thinking():
    """Explain the student's thinking process and guide to better logic"""
    try:
        data = request.json
        code = data.get('code', '')
        error_type = data.get('errorType', None)
        language = data.get('language', 'en')
        
        if not TEACHING_ENGINE_AVAILABLE:
            return jsonify({"explanation": "Thinking analysis not available"})
        
        thinking_explanation = explain_thinking_process(code, error_type, language)
        
        return jsonify({
            "explanation": thinking_explanation,
            "type": "thinking"
        })
    
    except Exception as e:
        print(f"Thinking explanation error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/gurujii/curriculum', methods=['GET'])
def get_curriculum():
    """Get structured learning content aligned with school curriculum"""
    try:
        grade = int(request.args.get('grade', 9))
        language = request.args.get('language', 'en')
        
        if not TEACHING_ENGINE_AVAILABLE:
            return jsonify({"topics": []})
        
        curriculum = get_curriculum_content(grade, language)
        
        return jsonify(curriculum)
    
    except Exception as e:
        print(f"Curriculum error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/gurujii/why', methods=['POST'])
def explain_why():
    """Explain WHY an error happens (deep understanding)"""
    try:
        data = request.json
        error_type = data.get('errorType', '')
        language = data.get('language', 'en')
        
        if not TEACHING_ENGINE_AVAILABLE or error_type not in OFFLINE_ERROR_DB:
            return jsonify({"explanation": "Explanation not available"})
        
        error_info = OFFLINE_ERROR_DB[error_type].get(language, OFFLINE_ERROR_DB[error_type]["en"])
        
        response = f"""🤔 Why does this error happen?

{error_info['why']}

📚 Concept: {error_info['concept']}

💡 How to fix:
{error_info['fix']}

This understanding will help you avoid this error in the future!"""
        
        return jsonify({
            "explanation": response,
            "concept": error_info['concept']
        })
    
    except Exception as e:
        print(f"Why explanation error: {e}")
        return jsonify({"error": str(e)}), 500

# Serve static audio files
@app.route('/audio/<path:filename>')
def serve_audio(filename):
    """Serve generated audio files"""
    from flask import send_from_directory
    return send_from_directory('static/audio', filename)

if __name__ == '__main__':
    print("Starting Gurujii API Server...")
    
    # Load models on startup
    models_loaded = load_models()
    
    if not models_loaded:
        print("Warning: Some models failed to load. Running with limited functionality.")
    
    # Start Flask server
    app.run(host='0.0.0.0', port=5000, debug=True)
