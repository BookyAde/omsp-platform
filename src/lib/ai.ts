// src/lib/ai.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const ReviewSchema = z.object({
  summary: z.string(),
  location_analysis: z.string(),
  score: z.number().min(1).max(10),
  strengths: z.array(z.string()),
  improvements: z.array(z.string()),
  flags: z.array(z.string()),
  rejection_risk: z.enum(["low", "medium", "high"]),
  promising: z.boolean(),
  fields_summary: z.string().optional(), // e.g., "Marine Biology: 3, Oceanography: 2, Coastal Management: 1"
});

export async function reviewSubmission(submissionData: any) {
  const modelsToTry = [
    "gemini-2.5-flash",
    "gemini-3.5-flash",
    "gemini-1.5-flash-8b"
  ];

  let lastError: any = null;

  for (const modelName of modelsToTry) {
    try {
      console.log(`Trying model: ${modelName}`);

      const model = genAI.getGenerativeModel({ 
        model: modelName,
        generationConfig: { 
          responseMimeType: "application/json",
          temperature: 0.35
        }
      });

      const prompt = `You are a senior marine science expert and reviewer for OMSP (Organization of Marine Science Professionals).

Submission Data:
${JSON.stringify(submissionData, null, 2)}

Analyze this submission thoroughly and return **ONLY** valid JSON in this exact format:

{
  "summary": "A concise, professional overall summary (2-4 sentences)",
  "location_analysis": "Analysis of geographic location, coastal relevance, or region mentioned",
  "score": 8,
  "strengths": ["strong point 1", "strong point 2"],
  "improvements": ["specific improvement 1", "specific improvement 2"],
  "flags": ["any red flags or missing critical info"],
  "rejection_risk": "low" | "medium" | "high",
  "promising": true,
  "fields_summary": "Summary of fields of study / institutions mentioned (e.g. Marine Biology: 2, Oceanography: 1)"
}

Focus especially on:
- Scientific quality and relevance to marine science, oceanography, coastal studies
- Geographic/location context (Nigeria, West Africa, etc.)
- Clarity, completeness, and professionalism
- Overall "cool factor" / future potential of the applicant`;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      
      const parsed = JSON.parse(text);
      const review = ReviewSchema.parse(parsed);
      
      console.log(`✅ AI Review successful with ${modelName}`);
      return review;

    } catch (error: any) {
      lastError = error;
      console.warn(`Model ${modelName} failed:`, error?.message || error);
      
      if (modelsToTry.indexOf(modelName) < modelsToTry.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  // Fallback
  console.error("All models failed:", lastError?.message);
  return {
    summary: "AI review service is temporarily busy. Please try again shortly.",
    location_analysis: "Location data not analyzed due to service issue.",
    score: 5,
    strengths: ["Submission received"],
    improvements: ["Retry AI Review in a moment"],
    flags: ["Service unavailable"],
    rejection_risk: "medium",
    promising: false,
    fields_summary: "Unable to analyze at the moment"
  };
}