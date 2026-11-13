'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Compass,
  ShieldCheck,
  Sparkles,
  Clock,
  Layers,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useIkebanaStore, ArrangementOption } from '@/store/useIkebanaStore';

const STYLE_TABS: { id: ArrangementOption['styleId']; shortLabel: string; kanji: string }[] = [
  { id: 'moribana-slanted', shortLabel: 'Slanted', kanji: '傾斜態' },
  { id: 'moribana-upright', shortLabel: 'Upright', kanji: '直立態' },
  { id: 'jiyuka-freestyle', shortLabel: 'Freestyle', kanji: '自由花' },
];

export default function StudioPage() {
  const router = useRouter();
  const {
    uploadedImages,
    inventory,
    arrangements,
    selectedStyleId,
    renderedPreviewUrl,
    selectStyle,
    setRenderedPreviewUrl,
  } = useIkebanaStore();

  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [renderError, setRenderError] = useState<string | null>(null);

  const currentStyle =
    arrangements.find((a) => a.styleId === selectedStyleId) || arrangements[0];

  const totalMinutes = currentStyle
    ? currentStyle.steps.reduce((sum, s) => sum + (s.estimatedMinutes || 3), 0)
    : 0;

  const canRenderFromSource = uploadedImages.length > 0 && Boolean(currentStyle);

  const handleGenerateReference = async () => {
    if (!canRenderFromSource || !currentStyle) return;
    setRenderError(null);
    setIsRendering(true);

    try {
      const response = await fetch('/api/render-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          images: uploadedImages,
          inventory,
          selectedPlan: currentStyle,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to render target composition.');
      }

      setRenderedPreviewUrl(data.renderedImageBase64);
    } catch (err: unknown) {
      setRenderError(
        err instanceof Error ? err.message : 'Unable to generate reference preview.'
      );
    } finally {
      setIsRendering(false);
    }
  };

  return (
    <div className="bg-surface-base text-text-primary antialiased min-h-screen flex flex-col font-body-regular selection:bg-primary-fixed max-w-[430px] mx-auto w-full relative shadow-xl border-x border-border-hairline/60">
      {/* Sticky Top App Bar */}
      <header className="sticky top-0 w-full z-40 pt-safe bg-surface-base/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-border-hairline/40">
        <div className="h-14 px-margin flex items-center justify-between">
          <button
            aria-label="Back to Inventory"
            type="button"
            onClick={() => router.push('/inventory')}
            className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-text-primary hover:bg-surface-container active:scale-95 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <h1 className="font-serif text-[17px] font-semibold tracking-tight text-text-primary">
            生け花 · Composition Studio
          </h1>

          <span className="font-label-micro text-[11px] font-semibold text-accent-moss bg-primary-fixed/80 px-2.5 py-1 rounded-full">
            Step 2 of 3: Studio
          </span>
        </div>
      </header>

      <main className="flex-1 flex flex-col px-margin pt-4 pb-36 gap-5">
        {!currentStyle ? (
          <div className="rounded-2xl border border-border-hairline bg-surface-card p-6 text-center flex flex-col items-center gap-3">
            <Sparkles className="w-6 h-6 text-accent-moss" />
            <h2 className="font-serif text-[17px] font-semibold text-text-primary">
              No Botanical Blueprints Loaded
            </h2>
            <p className="font-body-small text-[13px] text-text-muted">
              Return to Inventory to capture your materials or load the sample kit first.
            </p>
            <button
              type="button"
              onClick={() => router.push('/inventory')}
              className="mt-1 px-5 h-10 rounded-full bg-primary text-on-primary font-body-small text-[13px] font-medium cursor-pointer"
            >
              Go to Inventory
            </button>
          </div>
        ) : (
          <>
            {/* 3-Style Segmented Selector */}
            <nav
              aria-label="Ikebana style selector"
              className="grid grid-cols-3 gap-1.5 p-1.5 rounded-2xl bg-surface-container-low border border-border-hairline"
            >
              {STYLE_TABS.map((tab) => {
                const isSelected = currentStyle.styleId === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setRenderError(null);
                      selectStyle(tab.id);
                    }}
                    className={`py-2 px-2 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-surface-card text-text-primary shadow-xs border border-border-hairline/80'
                        : 'text-text-muted hover:text-text-primary'
                    }`}
                  >
                    <span className="font-serif text-[12px] font-semibold leading-tight">
                      {tab.kanji}
                    </span>
                    <span className="font-label-micro text-[11px] font-medium mt-0.5">
                      {tab.shortLabel}
                    </span>
                  </button>
                );
              })}
            </nav>

            {/* Active Blueprint Overview Card */}
            <section className="rounded-3xl bg-surface-card border border-border-hairline p-4 shadow-xs flex flex-col gap-3.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-label-micro text-[10px] font-bold uppercase tracking-wider text-accent-moss bg-primary-fixed/80 px-2.5 py-0.5 rounded-full">
                    {currentStyle.difficulty} · {currentStyle.stabilityScore}
                  </span>
                  <h2 className="font-serif text-[19px] font-semibold text-text-primary mt-1.5 leading-snug">
                    {currentStyle.styleTitle}
                  </h2>
                </div>
                <div className="flex items-center gap-1 text-text-muted bg-surface-container-low px-2.5 py-1 rounded-full shrink-0">
                  <Clock className="w-3.5 h-3.5 text-accent-moss" />
                  <span className="font-label-micro text-[11px] font-semibold">
                    ~{totalMinutes}m
                  </span>
                </div>
              </div>

              {/* Zero-Hallucination Target Reference Preview */}
              <div className="rounded-2xl border border-border-hairline bg-surface-container-low/70 overflow-hidden">
                {renderedPreviewUrl ? (
                  <div className="relative">
                    <img
                      src={renderedPreviewUrl}
                      alt={`Target reference render for ${currentStyle.styleTitle}`}
                      className="w-full h-[250px] object-cover"
                    />
                    <div className="px-3 py-2 bg-surface-card/95 backdrop-blur-xs border-t border-border-hairline/60 flex items-center justify-between gap-2">
                      <span className="font-label-micro text-[10px] font-semibold text-accent-moss">
                        Target Reference · Source Materials Only
                      </span>
                      <button
                        type="button"
                        disabled={isRendering || !canRenderFromSource}
                        onClick={handleGenerateReference}
                        className="text-[11px] font-semibold text-text-primary hover:text-accent-moss inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        <RefreshCw
                          className={`w-3 h-3 ${isRendering ? 'animate-spin' : ''}`}
                        />
                        <span>{isRendering ? 'Rendering...' : 'Regenerate'}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 flex flex-col gap-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-body-small text-[13px] font-semibold text-text-primary">
                          Target Composition Preview
                        </p>
                        <p className="font-label-micro text-[11px] text-text-muted mt-0.5 leading-relaxed">
                          {canRenderFromSource
                            ? 'Composites only your uploaded vessel, stems, and stones at the exact blueprint angles.'
                            : 'Upload your own material photos in Inventory to render a zero-hallucination target preview.'}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={!canRenderFromSource || isRendering}
                      onClick={handleGenerateReference}
                      className="h-10 rounded-full bg-surface-card border border-border-hairline text-text-primary font-body-small text-[12px] font-semibold flex items-center justify-center gap-2 hover:bg-surface-container active:scale-98 transition-all shadow-2xs cursor-pointer disabled:opacity-45 disabled:pointer-events-none"
                    >
                      {isRendering ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 text-accent-moss animate-spin" />
                          <span>Composing From Your Materials...</span>
                        </>
                      ) : (
                        <>
                          <ImageIcon className="w-3.5 h-3.5 text-accent-moss" />
                          <span>Generate Target Reference</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {renderError && (
                <div className="bg-secondary-fixed/70 border border-accent-vermilion/40 rounded-xl p-2.5 flex items-start gap-2 text-accent-vermilion">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="text-[11px] leading-snug">{renderError}</span>
                </div>
              )}

              {/* Zero-Kenzan DIY Anchor Callout */}
              <div className="rounded-2xl bg-primary-fixed/45 border border-accent-moss/25 p-3.5 flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5 text-accent-moss">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span className="font-label-micro text-[11px] font-bold uppercase tracking-wider">
                    Zero-Kenzan Anchor · {currentStyle.diyAnchorMechanism.methodName}
                  </span>
                </div>
                <p className="font-body-small text-[12px] text-text-primary leading-relaxed">
                  {currentStyle.diyAnchorMechanism.setupInstructions}
                </p>
              </div>
            </section>

            {/* Structural Steps Preview */}
            <section className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <h3 className="font-subheading-h3 text-[15px] font-semibold text-text-primary flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-accent-moss" />
                  <span>Blueprint Sequence ({currentStyle.steps.length} Steps)</span>
                </h3>
                <span className="font-label-micro text-[11px] text-text-muted">
                  {inventory.length} materials used
                </span>
              </div>

              <div className="flex flex-col gap-2.5">
                {currentStyle.steps.map((step) => (
                  <article
                    key={step.stepNumber}
                    className="rounded-2xl bg-surface-card border border-border-hairline p-3.5 shadow-2xs flex items-start gap-3"
                  >
                    <span className="w-6 h-6 rounded-full bg-primary text-on-primary font-label-micro text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {step.stepNumber}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-body-small text-[13px] font-semibold text-text-primary leading-snug">
                        {step.title}
                      </h4>
                      <p className="font-label-micro text-[11px] text-accent-moss font-medium mt-0.5 flex items-center gap-1">
                        <Compass className="w-3 h-3 shrink-0" />
                        <span className="truncate">{step.placementAngles}</span>
                      </p>
                      <p className="font-label-micro text-[11px] text-text-muted mt-1">
                        Cut: {step.mizukiriCutSpec}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </>
        )}
      </main>

      {/* Sticky Bottom Action Dock */}
      <aside className="fixed bottom-0 inset-x-0 z-40 bg-surface-base/90 backdrop-blur-md px-margin py-3 pb-safe border-t border-border-hairline/70 max-w-[430px] mx-auto">
        <button
          type="button"
          disabled={!currentStyle}
          onClick={() => router.push('/workbench')}
          className="w-full h-[52px] rounded-full bg-primary hover:bg-accent-moss text-on-primary font-body-small text-[14px] font-semibold shadow-sm flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
        >
          <span>Enter Tactile Workbench</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </aside>
    </div>
  );
}
