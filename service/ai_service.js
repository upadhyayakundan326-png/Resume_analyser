const ai = require("../config/gemini");

const analyzeResume = async (resumeText) => {

  const prompt = `
  Analyze this resume.

  Give:
  1. Score out of 100
  2. Skills
  3. Short analysis about resume
  4.if score is not 100 then give the analysis on how to improve it 

  Resume:
  ${resumeText}
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt
  });

  return response.text;
};

module.exports = analyzeResume;