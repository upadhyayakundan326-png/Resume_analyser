const { GoogleGenAI } = require("@google/genai");
  console.log(
  "API KEY:",
  process.env.GEMINI_API_KEY ? "FOUND" : "NOT FOUND"
);

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

module.exports = ai;