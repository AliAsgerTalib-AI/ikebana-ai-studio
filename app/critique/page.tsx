'use client';

import React, { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Camera, Upload, RotateCcw, Sparkles,
  CheckCircle2, AlertCircle, Loader2, Compass, Award,
} from 'lucide-react';
import { useIkebanaStore } from '@/store/useIkebanaStore';
import { compressImageFile } from '@/utils/imageCompression';

interface CritiqueResult {
  overallHarmonyScore: number;
  hankoVerdict: string;
  metrics: { asymmetricBalance: number; maNegativeSpace: number; angleAccuracy: number };
  vectorOverlay: {
    shinLine: { x1: number; y1: number; x2: number; y2: number };
    soeLine: { x1: number; y1: number; x2: number; y2: number };
    hikaeLine: { x1: number; y1: number; x2: number; y2: number };
  };
  mastersObservations: { strength: string; microAdjustment: string; philosophicalNote: string };
}

const DEFAULT_CRITIQUE: CritiqueResult = {
  overallHarmonyScore: 88,
  hankoVerdict: '合格',
  metrics: { asymmetricBalance: 92, maNegativeSpace: 86, angleAccuracy: 85 },
  vectorOverlay: {
    shinLine: { x1: 145, y1: 235, x2: 88, y2: 48 },
    soeLine: { x1: 145, y1: 235, x2: 56, y2: 138 },
    hikaeLine: { x1: 145, y1: 235, x2: 228, y2: 168 },
  },
  mastersObservations: {
    strength: 'Strong upward tension along the primary Shin branch creates clear vertical poise above the water plane.',
    microAdjustment: 'Rotate the focal Hikae bloom 12° forward toward the viewer to deepen the three-dimensional triangle.',
    philosophicalNote: 'Ma (negative space) breathes naturally between the secondary stem and the basin rim.',
  },
};

export default function CritiquePage() {
  const router = useRouter();
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  const selectedPlan = useIkebanaStore((state) =>
    state.arrangements.find((a) => a.styleId === state.selectedStyleId)
  );

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [critique, setCritique] = useState<CritiqueResult>(DEFAULT_CRITIQUE);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [hasLiveResult, setHasLiveResult] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handlePhotoSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMessage(null);
    setIsEvaluating(true);
    try {
      const { base64: base64Data, mimeType } = await compressImageFile(file, 1400, 0.82);
      setPhotoPreview(base64Data);
      const response = await fetch('/api/critique', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Data,
          mimeType,
          targetPlan: selectedPlan || undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to critique arrangement photo.');
      setCritique({
        overallHarmonyScore: data.overallHarmonyScore ?? 88,
        hankoVerdict: data.hankoVerdict || '合格',
        metrics: {
          asymmetricBalance: data.metrics?.asymmetricBalance ?? 88,
          maNegativeSpace: data.metrics?.maNegativeSpace ?? 85,
          angleAccuracy: data.metrics?.angleAccuracy ?? 84,
        },
        vectorOverlay: data.vectorOverlay || DEFAULT_CRITIQUE.vectorOverlay,
        mastersObservations: {
          strength: data.mastersObservations?.strength || DEFAULT_CRITIQUE.mastersObservations.strength,
          microAdjustment: data.mastersObservations?.microAdjustment || DEFAULT_CRITIQUE.mastersObservations.microAdjustment,
          philosophicalNote: data.mastersObservations?.philosophicalNote || DEFAULT_CRITIQUE.mastersObservations.philosophicalNote,
        },
      });
      setHasLiveResult(true);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Critique evaluation failed.');
    } finally {
      setIsEvaluating(false);
      e.target.value = '';
    }
  };

  return (
    <div className="bg-surface-base text-text-primary antialiased min-h-screen flex flex-col font-body-regular selection:bg-primary-fixed max-w-[430px] mx-auto w-full relative shadow-xl border-x border-border-hairline/60">
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handlePhotoSelected} className="hidden" />
      <input ref={uploadInputRef} type="file" accept="image/*" onChange={handlePhotoSelected} className="hidden" />

      <header className="sticky top-0 w-full z-40 pt-safe bg-surface-base/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-border-hairline/40">
        <div className="h-14 px-margin flex items-center justify-between">
          <button aria-label="Back to Workbench" type="button" onClick={() => router.push('/workbench')} className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-text-primary hover:bg-surface-container active:scale-95 transition-all cursor-pointer">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-serif text-[17px] font-semibold tracking-tight text-text-primary">生け花 · Master Critique</h1>
          <span className="font-label-micro text-[11px] font-semibold text-accent-vermilion bg-secondary-fixed/80 px-2.5 py-1 rounded-full">Final Review</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col px-margin pt-4 pb-36 gap-5">
        <div className="bg-surface-container-low rounded-2xl px-3.5 py-2.5 border border-border-hairline/80 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <Compass className="w-4 h-4 text-accent-moss shrink-0" />
            <span className="font-body-small text-[12px] font-medium text-text-primary truncate">
              {selectedPlan ? `Evaluating: ${selectedPlan.styleTitle}` : 'General Classical Ikebana Evaluation'}
            </span>
          </div>
          <span className="font-label-micro text-[10px] font-semibold text-text-muted shrink-0">{hasLiveResult ? 'Live AI' : 'Sample'}</span>
        </div>

        <section className="relative rounded-3xl overflow-hidden border border-border-hairline bg-surface-card shadow-sm">
          <div className="relative h-[300px] w-full bg-surface-container-low flex items-center justify-center overflow-hidden">
            {photoPreview ? (
              <img src={photoPreview} alt="Finished Ikebana arrangement" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center px-6 flex flex-col items-center">
                <div className="w-13 h-13 rounded-full bg-primary-fixed flex items-center justify-center mb-3">
                  <Camera className="w-6 h-6 text-accent-moss" />
                </div>
                <p className="font-serif text-[16px] font-semibold text-text-primary">Capture Finished Arrangement</p>
                <p className="font-body-small text-[12px] text-text-muted mt-1 max-w-[240px]">Snap or upload your completed composition at eye level to overlay structural angle vectors.</p>
              </div>
            )}

            {isEvaluating && (
              <div className="absolute inset-0 bg-surface-base/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-7 h-7 text-accent-moss animate-spin" />
                <p className="font-serif text-[15px] font-semibold text-text-primary">Measuring Shin-Soe-Hikae Vectors...</p>
              </div>
            )}

            <svg viewBox="0 0 290 260" className="absolute inset-0 z-10 w-full h-full pointer-events-none">
              <line x1={critique.vectorOverlay.shinLine.x1} y1={critique.vectorOverlay.shinLine.y1} x2={critique.vectorOverlay.shinLine.x2} y2={critique.vectorOverlay.shinLine.y2} stroke="#D0E9D3" strokeWidth="3" strokeDasharray="5 4" strokeLinecap="round" />
              <line x1={critique.vectorOverlay.soeLine.x1} y1={critique.vectorOverlay.soeLine.y1} x2={critique.vectorOverlay.soeLine.x2} y2={critique.vectorOverlay.soeLine.y2} stroke="#FFFFFF" strokeWidth="2.5" strokeDasharray="4 4" strokeLinecap="round" />
              <line x1={critique.vectorOverlay.hikaeLine.x1} y1={critique.vectorOverlay.hikaeLine.y1} x2={critique.vectorOverlay.hikaeLine.x2} y2={critique.vectorOverlay.hikaeLine.y2} stroke="#BD4B37" strokeWidth="2.5" strokeDasharray="4 4" strokeLinecap="round" />
            </svg>

            <div className="absolute top-3.5 right-3.5 z-20 w-12 h-12 rounded-xl border-2 border-accent-vermilion bg-surface-card/90 backdrop-blur-xs flex flex-col items-center justify-center shadow-sm rotate-3">
              <span className="font-serif text-[15px] font-bold text-accent-vermilion leading-none">{critique.hankoVerdict}</span>
              <span className="font-label-micro text-[8px] font-bold uppercase tracking-widest text-accent-vermilion mt-0.5">Hanko</span>
            </div>

            <div className="absolute bottom-3 left-3.5 z-20 bg-primary/95 text-on-primary px-3.5 py-1.5 rounded-full flex items-center gap-2 shadow-sm">
              <Award className="w-4 h-4 text-primary-fixed" />
              <span className="font-body-small text-[13px] font-semibold">Harmony: {critique.overallHarmonyScore}%</span>
            </div>
          </div>

          <div className="p-3 bg-surface-card border-t border-border-hairline/60 grid grid-cols-2 gap-2">
            <button type="button" disabled={isEvaluating} onClick={() => cameraInputRef.current?.click()} className="h-10 rounded-full bg-primary text-on-primary font-body-small text-[12px] font-medium flex items-center justify-center gap-1.5 hover:bg-accent-moss active:scale-95 transition-all cursor-pointer disabled:opacity-50">
              <Camera className="w-3.5 h-3.5" />
              <span>{photoPreview ? 'Retake Photo' : 'Snap Arrangement'}</span>
            </button>
            <button type="button" disabled={isEvaluating} onClick={() => uploadInputRef.current?.click()} className="h-10 rounded-full bg-surface-container-low text-text-primary border border-border-hairline font-body-small text-[12px] font-medium flex items-center justify-center gap-1.5 hover:bg-surface-container active:scale-95 transition-all cursor-pointer disabled:opacity-50">
              <Upload className="w-3.5 h-3.5 text-text-muted" />
              <span>Upload Photo</span>
            </button>
          </div>
        </section>

        {errorMessage && (
          <div className="bg-secondary-fixed/70 border border-accent-vermilion/40 rounded-xl p-3 flex items-start gap-2.5 text-accent-vermilion">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="text-[12px] leading-snug"><span className="font-semibold block">Evaluation Error</span><span>{errorMessage}</span></div>
          </div>
        )}

        <section className="grid grid-cols-3 gap-2.5">
          <div className="bg-surface-card rounded-2xl p-3 border border-border-hairline text-center shadow-xs">
            <p className="font-serif text-[19px] font-bold text-text-primary">{critique.metrics.asymmetricBalance}%</p>
            <p className="font-label-micro text-[10px] text-text-muted mt-0.5">Asymmetry</p>
          </div>
          <div className="bg-surface-card rounded-2xl p-3 border border-border-hairline text-center shadow-xs">
            <p className="font-serif text-[19px] font-bold text-accent-moss">{critique.metrics.maNegativeSpace}%</p>
            <p className="font-label-micro text-[10px] text-text-muted mt-0.5">Ma Space</p>
          </div>
          <div className="bg-surface-card rounded-2xl p-3 border border-border-hairline text-center shadow-xs">
            <p className="font-serif text-[19px] font-bold text-accent-vermilion">{critique.metrics.angleAccuracy}%</p>
            <p className="font-label-micro text-[10px] text-text-muted mt-0.5">Line Angles</p>
          </div>
        </section>

        <section className="bg-surface-card rounded-2xl p-4 border border-border-hairline shadow-xs flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-[16px] font-semibold text-text-primary flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-accent-moss" />
              <span>Master&apos;s Observations</span>
            </h2>
            <CheckCircle2 className="w-4 h-4 text-accent-moss" />
          </div>
          <div className="flex flex-col gap-2.5 text-[13px] leading-relaxed">
            <div className="p-3 rounded-xl bg-primary-fixed/40 border border-accent-moss/20">
              <span className="font-label-micro text-[10px] font-bold uppercase tracking-wider text-accent-moss block mb-0.5">Structural Strength</span>
              <p className="text-text-primary">{critique.mastersObservations.strength}</p>
            </div>
            <div className="p-3 rounded-xl bg-secondary-fixed/40 border border-accent-vermilion/20">
              <span className="font-label-micro text-[10px] font-bold uppercase tracking-wider text-accent-vermilion block mb-0.5">Refinement Opportunity</span>
              <p className="text-text-primary">{critique.mastersObservations.microAdjustment}</p>
            </div>
            <p className="font-serif italic text-[13px] text-text-muted pt-1 border-t border-border-hairline/60">&ldquo;{critique.mastersObservations.philosophicalNote}&rdquo;</p>
          </div>
        </section>
      </main>

      <aside className="fixed bottom-0 inset-x-0 z-40 bg-surface-base/90 backdrop-blur-md px-margin py-3 pb-safe border-t border-border-hairline/70 max-w-[430px] mx-auto">
        <div className="grid grid-cols-2 gap-2.5">
          <button type="button" onClick={() => router.push('/workbench')} className="h-[50px] rounded-full bg-surface-card border border-border-hairline text-text-primary font-body-small text-[13px] font-semibold flex items-center justify-center gap-1.5 hover:bg-surface-container active:scale-98 transition-all cursor-pointer">
            <RotateCcw className="w-4 h-4 text-text-muted" />
            <span>Adjust in Workbench</span>
          </button>
          <button type="button" onClick={() => router.push('/inventory')} className="h-[50px] rounded-full bg-primary hover:bg-accent-moss text-on-primary font-body-small text-[13px] font-semibold shadow-sm flex items-center justify-center gap-1.5 active:scale-98 transition-all cursor-pointer">
            <Sparkles className="w-4 h-4" />
            <span>New Arrangement</span>
          </button>
        </div>
      </aside>
    </div>
  );
}
