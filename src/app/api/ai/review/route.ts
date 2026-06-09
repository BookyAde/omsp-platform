// src/app/api/ai/review/route.ts
import { reviewSubmission } from '@/lib/ai';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { submissionId, submissionData } = await request.json();

    if (!submissionId) {
      return Response.json({ error: "submissionId is required" }, { status: 400 });
    }

    const review = await reviewSubmission(submissionData);

    const supabase = await createServerSupabaseClient();

    const { error } = await supabase
      .from('submission_reviews')
      .insert({
        submission_id: submissionId,
        ...review
      });

    if (error) {
      console.error("Supabase insert error:", error);
      throw error;
    }

    return Response.json({ success: true, review });
  } catch (error: any) {
    console.error("AI Review Error:", error);
    return Response.json({ 
      error: error.message || "Failed to generate AI review" 
    }, { status: 500 });
  }
}