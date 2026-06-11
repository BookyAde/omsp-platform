// src/app/api/ai/generate-form/route.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: Request) {
  try {
    const { description } = await request.json();

    if (!description || description.length < 15) {
      return Response.json({ error: "Please provide a detailed description" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `You are an expert form designer for OMSP (Organization of Marine Science Professionals).

User request: "${description}"

Return a complete form configuration as JSON with this exact structure:

{
  "title": "Suggested Form Title",
  "description": "Short professional description",
  "visibility": "public",
  "requires_review": true,
  "generate_qr": true,
  "form_mode": "single_page",
  "deadline": null,
  "fields": [
    {
      "label": "Full Name",
      "field_type": "text",
      "required": true,
      "placeholder": "Enter your full name"
    }
  ],
  "approval_email_enabled": true,
  "approval_email_subject": "Your submission has been approved",
  "approval_email_message": "Hello {{name}}, ...",
  "rejection_email_enabled": true,
  "rejection_email_subject": "Update on your submission",
  "rejection_email_message": "Thank you {{name}}, ..."
}

Make it relevant to marine science professionals.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const config = JSON.parse(text);

    return Response.json(config);
  } catch (error: any) {
    console.error(error);
    return Response.json({ error: "Failed to generate form. Please try again." }, { status: 500 });
  }
}