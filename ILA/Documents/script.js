import OpenAI from "openai";
import readline from "readline";
import dotenv from "dotenv";
import {
  reg_applicationinstructions_schema,
  reg_applicationrequireddocument_schema,
  reg_documenttype_schema,
} from "./jsonSchema.js";
dotenv.config({
  path: "../.env",
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY2,
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Function to ask the user input through command line
const askQuestion = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
};

// First LLM Call: Get all questions at once based on schema
async function getQuestionsFromLLM(jsonSchema) {
  console.log("preparing questions, please wait...");
  const preparePrompt = `You are an intelligent assistant. Given the JSON structure below, return only the list of questions based on the attributes and their descriptions.

    Do NOT ask the user anything, just output a JSON array like this:

    Make sure there is a question corresponding to every field

    {
      "questions": [
        {"field": "tc_name", "required": true/false,  "question": "Enter a unique name for the individual license declaration question."},
        {"field": "reg_section_ordinal", "required": true/false, "question": "Enter the section number indicating the display order of this declaration text."},
        ...
      ]
    }

    Here is the JSON structure:

    ${JSON.stringify(jsonSchema, null, 2)}
    `;
  const completion = await openai.chat.completions.create({
    model: "gpt-4", // You can switch to "gpt-3.5-turbo" if needed
    messages: [
      {
        role: "system",
        content: preparePrompt,
      },
    ],
  });

  return JSON.parse(completion.choices[0].message.content).questions;
}

// Local Question Handling Function
const askQuestionsLocally = async (questions) => {
  const responses = {};

  for (const { field, required, question } of questions) {
    while (true) {
      const answer = await new Promise((resolve) => {
        rl.question(`${question}: `, (userInput) => {
          resolve(userInput.trim());
        });
      });

      if (answer) {
        responses[field] = answer;
        break; // Move to next question
      }

      if (!required) {
        break; // Skip if optional and user leaves it empty
      }

      console.log("⚠️ This field is required. Please enter a response.");
    }
  }
  return responses;
};

// Main function to execute the flow and get data from LLM
const runConfigFlow = async () => {
  console.log("preparing data...");
  let finalConfig = {};

  // Step 1: Ask if they want to configure an Instructions Page
  const configureInstructions = await askQuestion(
    "\nWould you like to configure an instructions page? (Yes/No):\n"
  );

  if (configureInstructions.toLowerCase() === "yes") {
    finalConfig.instructions = await askQuestionsLocally(
      await getQuestionsFromLLM(reg_applicationinstructions_schema)
    );

    // Step 2: Ask if they want to create new document types
    const createNewDocumentTypes = await askQuestion(
      "Do you want to create new document types? (yes for Create New / no for Use Existing): "
    );

    let documentTypeQuestions = [];
    if (createNewDocumentTypes.toLowerCase() === "yes") {
      documentTypeQuestions = await getQuestionsFromLLM(
        reg_documenttype_schema
      );
      finalConfig.documentTypes = [];
      let moreDocs = true;
      while (moreDocs) {
        finalConfig.documentTypes.push(
          await askQuestionsLocally(documentTypeQuestions)
        );
        const addMoreDocs = await askQuestion(
          "Would you like to add another document type? (Yes/No): "
        );
        moreDocs = addMoreDocs.toLowerCase() === "yes";
      }
    }

    // Step 3: Configure Required Documents
    const createNewRequiredDocuments = await askQuestion(
      "Do you want to create new required document record? (yes for Create New / no for Use Existing): "
    );
    if (createNewRequiredDocuments.toLowerCase() === "yes") {
      let requiredDocQuestions = [];
      finalConfig.requiredDocuments = [];
      let moreReqDocs = true;
      while (moreReqDocs) {
        if (requiredDocQuestions.length === 0) {
          requiredDocQuestions = await getQuestionsFromLLM(
            reg_applicationrequireddocument_schema
          );
        }
        finalConfig.requiredDocuments.push(
          await askQuestionsLocally(requiredDocQuestions)
        );
        const addMoreReqDocs = await askQuestion(
          "Would you like to add another required document? (Yes/No): "
        );
        moreReqDocs = addMoreReqDocs.toLowerCase() === "yes";
      }
    }
  }

  console.log(
    "Final Configuration JSON:",
    JSON.stringify(finalConfig, null, 2)
  );

  rl.close();
  return finalConfig;
};

runConfigFlow();
