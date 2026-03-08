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
    """Main Gurujii engine to explain code errors"""
    
    # Execute code and get results
    execution_result = execute_python_code(code)
    
    if execution_result['success']:
        # Code executed successfully
        output = execution_result['output'].strip()
        
        if output:
            response = f"✓ Code executed successfully!\n\nOutput:\n{output}"
        else:
            response = "✓ Code executed successfully! No output produced."
        
        response_translated = translate_text(response, user_language)
        
        return {
            "explanation": response_translated,
            "hasError": False,
            "output": output,
            "detectedLanguage": user_language
        }
    
    # Code has errors
    error = execution_result['error']
    error_type = execution_result['error_type']
    error_message = execution_result['error_message']
    
    # Check if it's a known error type
    if error_type in ERROR_DB:
        base_message = ERROR_DB[error_type].get(user_language, ERROR_DB[error_type]["en"])
        
        # Add specific error details
        response = f"❌ {error_type}: {error_message}\n\n{base_message}"
        
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
            
            response = f"❌ {error_type}: {error_message}\n\n{llm_response}"
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
    response = f"❌ {error_type}: {error_message}\n\nThere's an error in your code. Please check the syntax and try again."
    
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
