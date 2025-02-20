import { jsonSchema } from "./reg_declarationquestion.js";

export const getListOfQuestions = `You are an intelligent assistant. Given the JSON structure below, return only the list of questions based on the attributes and their descriptions.
        
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
