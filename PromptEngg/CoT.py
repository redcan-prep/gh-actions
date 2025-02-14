import openai
import json
from sentence_transformers import SentenceTransformer, util
import numpy as np
import os
from dotenv import load_dotenv

load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY2")

# Load embedding model
embedding_model = SentenceTransformer("all-MiniLM-L6-v2")

def detect_category(user_input):
    """Step 1: Use LLM to detect what category the request falls into."""
    prompt = f"""
    Analyze the user's request: "{user_input}".
    Identify what category it falls into:
    - Application setup
    - Payment integration
    - API configuration
    - Authentication setup
    - Database setup
    - Other
    
    Return a JSON object with: {{ "category": "best-matching category" }}.
    If unclear, ask the user to clarify.
    """
    
    try:
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[{"role": "system", "content": prompt}],
            temperature=0.5
        )
        
        content = response["choices"][0]["message"]["content"]
        return json.loads(content)
    except Exception as e:
        print(f"Error: {e}")
        return {}

def detect_implicit_answers(user_input, category):
    """Step 2: Use NLP similarity to detect implicit answers from user input."""
    
    questions_dict = {
        "Application setup": [
            "What type of app (web, mobile, enterprise)?",
            "Which framework are you using (React, Angular, Vue, Django, etc.)?",
            "Do you need authentication (OAuth, JWT, API Key)?"
        ],
        "Payment integration": [
            "Which payment gateway do you want to use (Stripe, PayPal, Authorize.net)?",
            "Do you need recurring billing support?",
            "Do you need 3D Secure authentication?"
        ],
        "API configuration": [
            "Which API are you integrating?",
            "Do you need authentication for the API (OAuth, API Key)?",
            "Do you need rate limiting or caching?"
        ],
        "Authentication setup": [
            "Which authentication method are you using (OAuth, JWT, API Key)?",
            "Do you need multi-factor authentication?",
            "Do you need single sign-on (SSO)?"
        ],
        "Database setup": [
            "What database are you using (MySQL, PostgreSQL, MongoDB)?",
            "Do you need cloud hosting (AWS, Firebase, etc.)?",
            "Do you need database replication or backups?"
        ]
    }

    detected_answers = {}
    if category not in questions_dict:
        return detected_answers

    # Compute embeddings
    user_embedding = embedding_model.encode(user_input, convert_to_tensor=True)
    question_embeddings = embedding_model.encode(questions_dict[category], convert_to_tensor=True)

    # Compute cosine similarity
    similarities = util.cos_sim(user_embedding, question_embeddings)[0]
    print(similarities)
    # Mark questions as answered if similarity is above threshold
    threshold = 0.4
    for i, score in enumerate(similarities):
        if score.item() > threshold:
            detected_answers[questions_dict[category][i].lower()] = True

    return detected_answers

def ask_followup_questions(category, user_input, known_details):
    print('preparing followup questions if any...')
    """Step 3: Ask follow-up questions while skipping already answered ones."""
    
    all_answered_questions = {**detect_implicit_answers(user_input, category), 
                              **{q.lower(): True for q, a in known_details.items() if a}}

    print('all answer quest: ', all_answered_questions)
    questions_dict = {
        "Application setup": [
            "What type of app (web, mobile, enterprise)?",
            "Which framework are you using (React, Angular, Vue, Django, etc.)?",
            "Do you need authentication (OAuth, JWT, API Key)?"
        ],
        "Payment integration": [
            "Which payment gateway do you want to use (Stripe, PayPal, Authorize.net)?",
            "Do you need recurring billing support?",
            "Do you need 3D Secure authentication?"
        ],
        "API configuration": [
            "Which API are you integrating?",
            "Do you need authentication for the API (OAuth, API Key)?",
            "Do you need rate limiting or caching?"
        ],
        "Authentication setup": [
            "Which authentication method are you using (OAuth, JWT, API Key)?",
            "Do you need multi-factor authentication?",
            "Do you need single sign-on (SSO)?"
        ],
        "Database setup": [
            "What database are you using (MySQL, PostgreSQL, MongoDB)?",
            "Do you need cloud hosting (AWS, Firebase, etc.)?",
            "Do you need database replication or backups?"
        ]
    }

    # Filter out already answered questions
    if category in questions_dict:
        return [q for q in questions_dict[category] if q.lower() not in all_answered_questions]
    
    return ["Can you provide more details about your request?"]

def ask_llm(user_input, context_history):
    
    # Step 1: Detect category
    category = context_history.get("category", None)
    
    if not category:
        category_response = detect_category(user_input)
        category = category_response.get("category", "Other")
        context_history["category"] = category
    
    print(f"AI Detected Category: {category}")
    print('Almost there, stay with me, diamond in the making...')
    # if category is Other, we feed it to LLM to process output
    if category == "Other":
        final_prompt = f"""
            User wants to {user_input}.
            Please help with providing the information.
            """
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[{"role": "system", "content": final_prompt}],
            temperature=0.5
        )

        return {
            "status": "complete",
            "answer": response["choices"][0]["message"]["content"]
        }
    
    # Step 2: Check for remaining follow-up questions
    followup_questions = ask_followup_questions(category, user_input, context_history)
    print('follow up questions: ',followup_questions)
    if followup_questions:
        return {
            "status": "pending",
            "follow_up_question": followup_questions[0]  # Ask one question at a time
        }
    
    print('Will be retrieving Documentation from Vector DB in the future.')
    print('Almost there, stay with me, diamond in the making...')
    # Step 3: If all details are available, generate final response
    final_prompt = f"""
    User wants to {category}.
    Known details: {json.dumps(context_history)}

    Provide a detailed configuration guide.
    """
    
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[{"role": "system", "content": final_prompt}],
        temperature=0.5
    )

    return {
        "status": "complete",
        "answer": response["choices"][0]["message"]["content"]
    }


# Example Usage
context = {}
while True:
    category = context.get("category", None)
    if not category:
        user_input = input("User: ")
    llm_response = ask_llm(user_input, context)
    
    if llm_response["status"] == "pending":
        print(f"AI: {llm_response['follow_up_question']}")
        user_response = input("User: ")
        context[llm_response['follow_up_question']] = user_response
    else:
        print(f"AI Final Answer: {llm_response['answer']}")
        break  # Exit once we have enough information
