import OpenAI from "openai";
import readline from "readline";
import { finalPrompt } from "../prompt.js";
import dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY2
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function chatWithAI() {
  let messages = [{ role: "system", content: finalPrompt }];

  while (true) {
    // Log messages before API request
    // console.log("Messages before API request:", JSON.stringify(messages, null, 2));
    console.log("Processing, please wait...");
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: messages,
    });

    // Log the response
    // console.log("API Response:", JSON.stringify(completion, null, 2));

    const botResponse = completion.choices[0].message.content;
    console.log(`AI: ${botResponse}`);
    messages.push({ role: "assistant", content: botResponse });

    // Check if the bot has reached the end
    if (botResponse.toLowerCase().includes("final json")) {
      console.log("Conversation complete.");
      break;
    }

    // Get user input
    await new Promise((resolve) => {
      rl.question("You: ", (userInput) => {
        messages.push({ role: "user", content: userInput });
        resolve();
      });
    });
  }

  rl.close();
}

chatWithAI();
