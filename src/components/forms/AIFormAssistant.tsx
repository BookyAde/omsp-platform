'use client';

import { useState } from 'react';
import { X, Sparkles, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';

interface AIFormAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  onFormGenerated: (fullConfig: any) => void;   // Changed to full config
}

export default function AIFormAssistant({ isOpen, onClose, onFormGenerated }: AIFormAssistantProps) {
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!description.trim()) {
      setError("Please describe the form you want.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch('/api/ai/generate-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: description.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate form");
      }

      onFormGenerated(data);
      setDescription("");
      onClose();
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 px-4">
      <div className="w-full max-w-2xl bg-ocean-950 border border-ocean-700 rounded-2xl shadow-2xl overflow-hidden">
        <div className="border-b border-ocean-700 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="text-teal-400" size={24} />
            <div>
              <h2 className="text-xl font-semibold">AI Form Assistant</h2>
              <p className="text-sm text-slate-400">Describe the form you need</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white" disabled={loading}>
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="form-label mb-2 block">Form Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Create a professional membership application form for marine scientists including name, institution, research experience, CV upload, etc."
              className="form-input min-h-[160px] resize-y"
              disabled={loading}
            />
            <p className="text-xs text-slate-500 mt-2">
              Be specific. The AI will generate title, fields, settings, and email templates.
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
              {error}
            </div>
          )}
        </div>

        <div className="border-t border-ocean-700 px-6 py-5 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="btn-ghost px-6 py-2.5"
          >
            Cancel
          </button>
          <Button
            onClick={handleGenerate}
            disabled={loading || !description.trim()}
            className="flex items-center gap-2 px-8"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Generating Full Form...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Generate Complete Form
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}