'use client';

import { useState } from 'react';
import Button from "@/components/ui/Button";
import { Loader2, Sparkles, AlertTriangle, CheckCircle } from 'lucide-react';

interface AIReviewButtonProps {
  submissionId: string;
  submissionData: any;
  onReviewComplete?: (review: any) => void;
}

export default function AIReviewButton({ 
  submissionId, 
  submissionData, 
  onReviewComplete 
}: AIReviewButtonProps) {
  const [loading, setLoading] = useState(false);
  const [review, setReview] = useState<any>(null);

  const handleReview = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId, submissionData }),
      });

      if (!res.ok) throw new Error('Failed to get AI review');

      const data = await res.json();
      if (data.review) {
        setReview(data.review);
        onReviewComplete?.(data.review);
      }
    } catch (error) {
      console.error(error);
      alert("AI Review failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button 
        onClick={handleReview} 
        disabled={loading}
        className="flex items-center gap-2 border border-ocean-700 hover:bg-ocean-800 text-white w-full justify-center"
      >
        {loading ? (
          <Loader2 className="animate-spin h-4 w-4" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
        {loading ? "AI is Analyzing..." : "✦ Get AI Review"}
      </Button>

      {review && (
        <div className="border border-ocean-700 bg-ocean-950/70 rounded-xl p-5 space-y-4 text-sm">
          {/* Score & Verdict */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-mono font-bold text-emerald-400">
                {review.score}/10
              </span>
              {review.promising && (
                <CheckCircle className="text-emerald-500" size={20} />
              )}
              {review.rejection_risk === "high" && (
                <AlertTriangle className="text-red-500" size={20} />
              )}
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize
              ${review.rejection_risk === 'low' ? 'bg-green-500/20 text-green-400' : 
                review.rejection_risk === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 
                'bg-red-500/20 text-red-400'}`}>
              {review.rejection_risk} rejection risk
            </span>
          </div>

          {/* Main Summary */}
          <div>
            <p className="font-medium text-white mb-1">Summary</p>
            <p className="text-slate-300 leading-relaxed">{review.summary}</p>
          </div>

          {/* Location */}
          {review.location_analysis && (
            <div>
              <p className="font-medium text-white mb-1">Location Analysis</p>
              <p className="text-slate-400">{review.location_analysis}</p>
            </div>
          )}

          {/* Fields Summary */}
          {review.fields_summary && (
            <div>
              <p className="font-medium text-white mb-1">Fields of Study</p>
              <p className="text-slate-400">{review.fields_summary}</p>
            </div>
          )}

          {/* Strengths */}
          {review.strengths?.length > 0 && (
            <div>
              <p className="font-medium text-emerald-400 mb-1">Strengths</p>
              <ul className="list-disc list-inside text-slate-300 space-y-1 text-sm">
                {review.strengths.map((item: string, i: number) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Improvements */}
          {review.improvements?.length > 0 && (
            <div>
              <p className="font-medium text-amber-400 mb-1">Areas Needing Attention</p>
              <ul className="list-disc list-inside text-slate-300 space-y-1 text-sm">
                {review.improvements.map((item: string, i: number) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {review.flags?.length > 0 && (
            <div className="text-red-400 text-xs">
              ⚠️ {review.flags.join(" • ")}
            </div>
          )}
        </div>
      )}
    </div>
  );
}