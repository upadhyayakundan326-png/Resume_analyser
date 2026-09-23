const ai = require("../config/gemini");

const analyzeResume = async (resumeText, job) => {
  try {
    const prompt = `
Analyze this resume against the job requirements.

Compare the resume with the required job skills and job description.
Based on the comparison, return a score, matched skills, analysis, and improvements.

Return the result ONLY as valid JSON.

The JSON must have exactly these fields:

{
  "score": 0,
  "skills": [],
  "analysis": "",
  "improvements": []
}

Rules:
- score must be a number from 0 to 100.
- skills must be an array of strings.
- analysis must be a short string.
- improvements must be an array of strings.
- Do not use markdown.
- Do not use code fences.
- Do not write anything before or after the JSON.

Job Title:
${job.title}

Required Skills:
${job.requiredSkills.join(", ")}

Job Description:
${job.description}

Resume:
${resumeText}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt
    });

    return response.text;
  } catch (error) {
    throw error;
  }
};

module.exports = analyzeResume;