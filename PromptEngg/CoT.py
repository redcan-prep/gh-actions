import openai
import json
import mysql.connector
from sentence_transformers import SentenceTransformer
import numpy as np
import os
from dotenv import load_dotenv
load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY2")

category_response = None

############### SINGLESTORE WILL BE DEALTH WITH LATER  ####################
# Connect to SingleStore
singlestore_config = {
    "host": os.getenv("SINGLESTORE_HOST"),
    "user": os.getenv("SINGLESTORE_USER"),
    "password": os.getenv("SINGLESTORE_PASSWORD"),
    "database": os.getenv("SINGLESTORE_DATABASE"),
    "port": os.getenv("SINGLESTORE_PORT")
}

# Load embedding model
embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
def search_singlestore(query):
    """Step 3: Searches SingleStore for relevant documentation."""
    query_embedding = embedding_model.encode(query).tolist()

    # Connect to SingleStore
    connection = mysql.connector.connect(**singlestore_config)
    cursor = connection.cursor()

    # Query SingleStore for closest matching embeddings
    query_str = """
    SELECT text, embedding FROM documents 
    ORDER BY (embedding <=> %s) ASC LIMIT 3;
    """

    cursor.execute(query_str, (json.dumps(query_embedding),))
    results = cursor.fetchall()

    # Close connection
    cursor.close()
    connection.close()

    return [result[0] for result in results]  # Return top document texts

############### ############### ############### ############### ###############

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
            model="gpt-4",  # Use the correct model name
            messages=[{"role": "system", "content": prompt}],
            temperature=0.5
        )
        
        # Debugging: Print the raw response to inspect
        # print("Raw API Response: ", response)
        
        content = response["choices"][0]["message"]["content"]
        
        # Ensure the content is in valid JSON format
        return json.loads(content)
    except json.JSONDecodeError as e:
        print(f"JSONDecodeError: {e}")
        print("Response content might not be valid JSON:", response["choices"][0]["message"]["content"])
        return {}  # Return empty or error response
    except Exception as e:
        print(f"Error: {e}")
        return {}


def ask_followup_questions(category, known_details):
    """Step 2: Ask relevant follow-up questions based on the category in one prompt."""
    
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
    
    if category in questions_dict:
        remaining_questions = [
            q for q in questions_dict[category] if q not in known_details
        ]
        return remaining_questions
    else:
        return ["Can you provide more details about your request?"]




def ask_llm(user_input, context_history):
    
    # Step 1: Detect category
   # Check if category is already in context
    category = context_history.get("category", None)
    
    # Step 1: Detect category if it's not already in context
    if not category:
        category_response = detect_category(user_input)
        category = category_response.get("category", "Other")
        context_history["category"] = category
    
    print(f"AI Detected Category: {category}")
    
    # Step 2: Check if we have enough details
    followup_questions = ask_followup_questions(category, context_history)
    
    if followup_questions:
        return {
            "status": "pending",
            "follow_up_question": followup_questions[0]  # Ask one question at a time
        }
    print('Will be retrieving Documentation from Vector DB in the future.')
    print('Stay with me, almost there...')
    # Step 3: If all details are available, query SingleStore for relevant docs
    relevant_docs =  "documents" #search_singlestore(category)

    # Step 4: Generate final answer using LLM with retrieved documents
    """Step 4: The main loop where LLM refines user input dynamically."""
    final_prompt = f"""
    User wants to {category}.
    Known details: {json.dumps(context_history)}

    Reference these documents to generate the most accurate response:
    {json.dumps(relevant_docs)}

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
        # Store the user response in context
        user_response = input("User: ")
        context[llm_response['follow_up_question']] = user_response
    else:
        print(f"AI Final Answer: {llm_response['answer']}")
        break  # Exit once we have enough information

