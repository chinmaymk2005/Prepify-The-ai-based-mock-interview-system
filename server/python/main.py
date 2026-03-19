import os
import pypdf
import time
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
import uvicorn
from dotenv import load_dotenv
from google import genai
from google.genai import types
from sarvamai import SarvamAI
import json
from datetime import datetime
import base64
import edge_tts
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, change "*" to your specific React URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- SARVAM SETUP ---
SARVAM_API_KEY = os.environ.get("SARVAM_API_KEY", "YOUR_SARVAM_API_KEY")
sarvam_client = SarvamAI(api_subscription_key=SARVAM_API_KEY)

#Voice
VOICE_ID = "en-US-BrianNeural"

# --- GEMINI ROTATION SETUP ---
# Put your keys and fallback models here. It will try them in order top-to-bottom.
GEMINI_CONFIGS = [
    {"api_key": os.environ.get("GEMINI_KEY_1", "YOUR_MAIN_KEY"), "model": "gemini-2.5-flash"},
    {"api_key": os.environ.get("GEMINI_KEY_2", "YOUR_BACKUP_KEY"), "model": "gemini-2.5-flash"},
    {"api_key": os.environ.get("GEMINI_KEY_1", "YOUR_MAIN_KEY"), "model": "gemini-2.5-flash-8b"} # Ultimate fallback model
]


# State Trackers
active_chat_history = [] 
current_user_transcript = ""
system_instruction_text = ""


async def generate_interviewer_audio(text):
    """Secretly streams Microsoft Azure Neural TTS directly into memory."""
    try:
        communicate = edge_tts.Communicate(text, VOICE_ID, rate="+25%")
        audio_data = b""
        
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio_data += chunk["data"]
                
        # Encode the raw MP3 audio into a Base64 string so we can send it in the JSON response
        return base64.b64encode(audio_data).decode('utf-8')
    except Exception as e:
        print(f"TTS Engine Error: {e}")
        return None
    

def get_clean_transcript():
    """Extracts a clean, JSON-ready array from Gemini's complex history."""
    global active_chat_history
    clean_log = []
    
    for message in active_chat_history:
        role = message.role 
        text = message.parts[0].text if message.parts else ""
        
        # We don't need to save the giant hidden system prompt
        if role == "user" and "Hello, I am ready for the interview." in text:
            text = "[System Start Trigger]"
            
        clean_log.append({
            "speaker": "Interviewer" if role == "model" else "Candidate",
            "text": text
        })
        
    return clean_log

def extract_text_from_pdf(pdf_path):
    # ... (Keep your exact PDF extraction code here) ...
    extracted_text = ""
    try:
        with open(pdf_path, 'rb') as file:
            pdf_reader = pypdf.PdfReader(file)
            for page in pdf_reader.pages:
                extracted_text += page.extract_text() + "\n"
        return extracted_text.strip()
    except:
        return "Resume data unavailable."

# ... (Keep your MASTER_PROMPT and ML_ENGINEER_GUIDELINE variables here) ...
MASTER_PROMPT = """You are an expert, professional technical interviewer.
Here is the candidate's resume:
{resume_text}

Here are the guidelines for the role they are applying for:
{role_guideline}

YOUR INSTRUCTIONS:
1. Conduct a realistic, back-and-forth technical interview.
2. Ask ONLY ONE question at a time. NEVER output a list of questions. Wait for the candidate's response before continuing.
3. THE OPENING: Start the interview by welcoming the candidate and asking them to briefly introduce themselves and their background. 
4. THE TRANSITION: Once they introduce themselves, acknowledge their introduction and ask your first targeted technical question based on a specific project or skill from their resume.
5. CROSS-QUESTIONING: Listen carefully to the candidate's answers. Ask follow-up questions to probe their actual depth of knowledge, trade-offs, and reasoning.
6. TIME MANAGEMENT & PIVOTING (CRITICAL CONSTRAINT): Limit your cross-questioning on any individual project, past role, or specific skill to a maximum of 3 to 4 questions. Once you hit this limit, you MUST explicitly transition to a completely different section of their resume. 
7. Keep your tone professional, encouraging, but rigorous. Do not provide answers or break character.
8. CONCISENESS (CRITICAL SYSTEM RULE): Keep your responses short, conversational, and directly to the point. NEVER yap or give long monologues. Limit your replies and questions to a maximum of 2 to 3 sentences.
"""

ML_ENGINEER_GUIDELINE = """
Target Role: Machine Learning Engineer (Mid-Level)

Core Competencies to Evaluate:
1. ML Fundamentals: Algorithm selection, bias-variance tradeoff, and evaluation metrics (Precision, Recall, F1, ROC-AUC) in imbalanced datasets.
2. Deep Learning & Advanced Models: Neural network architectures (Transformers, CNNs), attention mechanisms, fine-tuning strategies (LoRA, PEFT), and optimization.
3. MLOps & Production: Model serving (latency vs. throughput), containerization, monitoring (data drift, concept drift), and handling production bottlenecks.
4. Data/Feature Engineering: Data pipelines, handling missing data, and scaling data processing.

Interview Strategy & Focus:
- DO NOT ask for basic textbook definitions (e.g., "What is a neural network?").
- DO ask about architectural decisions, trade-offs, and edge cases (e.g., "Why did you choose a Transformer over an LSTM for this specific latency constraint?").
- Probe their understanding of how their code operates in a real-world, scalable production environment, not just in a local Jupyter Notebook.
- If they mention a specific framework or tool in their resume, ask them about its limitations.
"""

def send_to_gemini_with_failover(user_message: str):
    """Tries keys and models in order until one succeeds."""
    global active_chat_history, system_instruction_text
    
    last_error = None
    
    for config in GEMINI_CONFIGS:
        print(f"Attempting to use model {config['model']} with key ending in ...{config['api_key'][-4:]}")
        try:
            # 1. Spin up a fresh client with the current config's key
            client = genai.Client(api_key=config['api_key'])
            
            # 2. Rebuild the chat session with our saved history
            chat_config = types.GenerateContentConfig(system_instruction=system_instruction_text)
            chat_session = client.chats.create(
                model=config['model'], 
                config=chat_config,
                history=active_chat_history
            )
            
            # 3. Send the message
            response = chat_session.send_message(user_message)
            
            # 4. If successful, save the new history so we don't lose it
            active_chat_history = chat_session.get_history()
            return response.text
            
        except Exception as e:
            last_error = str(e)
            print(f"Failed. Error: {last_error}")
            if "503" in last_error or "429" in last_error:
                print("Rotating to next backup config...")
                time.sleep(1) # Brief pause before hammering the next API
                continue
            else:
                # If it's a structural error (not a rate limit/server down), stop trying
                break 

    # If the loop finishes and all configs failed
    raise HTTPException(status_code=503, detail="All AI failovers exhausted. Please try again.")




@app.post("/api/start-interview")
async def start_interview():
    global active_chat_history, system_instruction_text, current_user_transcript
    
    resume_text = extract_text_from_pdf("sample_resume.pdf")
    system_instruction_text = MASTER_PROMPT + f"\nResume:\n{resume_text}\nGuidelines:\n{ML_ENGINEER_GUIDELINE}"
    
    # Reset state for a new interview
    active_chat_history = []
    current_user_transcript = ""
    
    reply_text = send_to_gemini_with_failover("Hello, I am ready for the interview. Please begin with the first question.")
    # 2. Generate the voice for that reply
    audio_base64 = await generate_interviewer_audio(reply_text)
    
    # 3. Send both back
    return {"reply": reply_text, "audio_data": audio_base64}

@app.post("/api/audio-chunk")
async def process_audio_chunk(audio_file: UploadFile = File(...), is_final: str = Form(...)):
    """Receives 25s chunks, transcribes them, and triggers Gemini only on the final chunk."""
    global current_user_transcript
    
    temp_file_path = f"temp_{audio_file.filename}"
    try:
        with open(temp_file_path, "wb+") as file_object:
            file_object.write(await audio_file.read())

        # Transcribe this specific 25s chunk
        with open(temp_file_path, "rb") as f:
            transcript_response = sarvam_client.speech_to_text.transcribe(
                file=f,
                model="saaras:v3",
                mode="transcribe" 
            )
            
        if transcript_response.transcript:
            current_user_transcript += transcript_response.transcript + " "
            print(f"[Chunk Received] Current text: {current_user_transcript}")

        # If the user is still speaking, just return a success status
        if is_final == "false":
            return {"status": "chunk_processed", "current_text": current_user_transcript}

        # --- IF THIS IS THE FINAL CHUNK, SEND TO GEMINI ---
        if is_final == "true":
            final_text = current_user_transcript.strip()
            
            if not final_text:
                return {"user_text": "", "reply": "I didn't quite catch that. Could you repeat?"}

            # 1. Get the text reply from the failover engine
            reply_text = send_to_gemini_with_failover(final_text)
            
            # 2. Generate the voice!
            audio_base64 = await generate_interviewer_audio(reply_text)
            
            current_user_transcript = "" 
            
            # 3. Send the complete package back to the frontend
            return {
                "user_text": final_text, 
                "reply": reply_text,
                "audio_data": audio_base64
            }

    except Exception as e:
        print(f"\n--- AUDIO PROCESSING ERROR ---\n{str(e)}\n")
        raise HTTPException(status_code=500, detail="Failed to process audio chunk.")
    finally:
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)

@app.post("/api/end-interview")
def end_interview():
    global active_chat_history, current_user_transcript
    
    if not active_chat_history:
        return {"message": "No interview data to save."}
        
    final_transcript = get_clean_transcript()
    
    # Generate a unique filename based on the current time
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"interview_dummy_db_{timestamp}.json"
    
    # Save it locally (Your temporary MongoDB)
    with open(filename, "w") as f:
        json.dump(final_transcript, f, indent=4)
        
    # Wipe the server memory clean for the next candidate
    active_chat_history = []
    current_user_transcript = ""
    
    return {
        "status": "success", 
        "filename": filename
    }

if __name__ == "__main__":
    print("Server starting at http://localhost:8001")
    uvicorn.run(app, host="0.0.0.0", port=8001)