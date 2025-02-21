import OpenAI from "openai";
import readline from "readline";
import dotenv from "dotenv";
import { getListOfQuestions } from "../prompt.js";
import { json } from "stream/consumers";
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY2,
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// First LLM Call: Get all questions at once
async function getQuestionsFromLLM() {
  const completion = await openai.chat.completions.create({
    model: "gpt-4",// "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: getListOfQuestions,
      },
    ],
    response_format: json,
  });

  return JSON.parse(completion.choices[0].message.content).questions;
}

// Ask user questions locally and collect answers
async function collectUserResponses(questions) {
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

  // Step 1: Show collected responses
  console.log("\n✅ Here are your answers:");
  Object.entries(responses).forEach(([key, value]) => {
    console.log(`${key}: ${value}`);
  });

  // Step 2: Allow modifications
  while (true) {
    const editChoice = await new Promise((resolve) => {
      rl.question("\nWould you like to modify any answer? (yes/no): ", (input) => {
        resolve(input.trim().toLowerCase());
      });
    });

    if (editChoice === "no") break;

    if (editChoice === "yes") {
      const fieldToEdit = await new Promise((resolve) => {
        rl.question("\nWhich field would you like to edit? (Enter the field name or 'done' to finish): ", (input) => {
          resolve(input.trim());
        });
      });

      if (fieldToEdit === "done") break;

      if (responses[fieldToEdit] !== undefined) {
        const newAnswer = await new Promise((resolve) => {
          rl.question(`\nEnter a new value for ${fieldToEdit}: `, (input) => {
            resolve(input.trim());
          });
        });

        responses[fieldToEdit] = newAnswer;
        console.log(`✅ Updated ${fieldToEdit} to: ${newAnswer}`);
      } else {
        console.log("⚠️ Invalid field name. Please try again.");
      }
    } else {
      console.log("⚠️ Please enter 'yes' or 'no'.");
    }
  }

  return responses;
}

// Second LLM Call: Format responses into a structured JSON
async function formatResponsesWithLLM(userResponses) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4", //"gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: `Given user responses to fields, format them into a structured JSON.
        
        Return only the final JSON with this format:
        
        {
          "userResponses": {
            "tc_name": "User's answer",
            "reg_section_ordinal": "User's answer",
            ...
          }
        }
        `,
      },
      {
        role: "user",
        content: JSON.stringify(userResponses),
      },
    ],
    response_format: json
  });

  return JSON.parse(completion.choices[0].message.content);
}

// Main function to execute the flow
async function chatWithAI() {
  console.log("Fetching questions from LLM...");
  const questions = await getQuestionsFromLLM();
  console.log("questions: ", questions);
  console.log("Questions received. Now collecting responses...");

  const userResponses = await collectUserResponses(questions);

  console.log("Formatting responses...");
  const finalJSON = await formatResponsesWithLLM(userResponses);

  console.log("Final JSON:", JSON.stringify(finalJSON, null, 2));

  rl.close();
}

chatWithAI();
