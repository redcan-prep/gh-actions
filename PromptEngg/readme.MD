Project Setup:

Follow these steps to set up and run the project:

1. Environment Setup:
    
    Create a .env file in the project root directory.
    Add the following line, replacing <api-key> with your actual API key:
        
        OPENAI_API_KEY2=yourApiKeyGoesHere

2. Install Dependencies:
    
    Run the following command to install all required Python packages:
    
    
        pip3 install openai mysql-connector-python sentence-transformers numpy python-dotenv

3. Available Versions: (FYI)
    
    The project has three available versions:

    main: A basic implementation that asks follow-up questions.
    
    feature/context-history-avoid-duplicate-followups:  
    Uses keyword matching and regular expressions to skip already answered questions. While it works, it is not scalable and requires extensive iterations as more code is added.
    
    feature/nlp-analyzing-user-input: Utilizes NLP techniques to analyze user input, skip previously answered questions, and also answer general queries that are not related to configuration.

4. Running the Project:
    
    To start the project, run:
        
        python3 CoT.py