'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Compass, Ruler, ShieldCheck, Mail } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="bg-surface-base text-text-primary antialiased min-h-screen flex flex-col justify-between font-body-regular selection:bg-primary-fixed max-w-[430px] mx-auto w-full relative shadow-xl border-x border-border-hairline/60">
      {/* Top Brand Header */}
      <header className="pt-safe px-margin pt-6 pb-3 flex items-center justify-between border-b border-border-hairline/40">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-primary text-on-primary font-serif text-[16px] font-bold flex items-center justify-center shadow-2xs">
            間
          </span>
          <span className="font-serif text-[19px] font-semibold tracking-tight text-text-primary">
            MaCraft
          </span>
        </div>
        <span className="font-label-micro text-[10px] font-bold uppercase tracking-widest text-accent-moss bg-primary-fixed/80 px-2.5 py-1 rounded-full">
          Ikebana Studio
        </span>
      </header>

      {/* Main Hero & Feature Pillars */}
      <main className="flex-1 flex flex-col justify-center px-margin py-8 gap-6">
        <div className="flex flex-col gap-3">
          <p className="font-label-micro text-[11px] font-bold uppercase tracking-widest text-accent-moss">
            Precision Floral Architecture
          </p>
          <h1 className="font-serif text-[32px] font-semibold leading-[1.15] tracking-tight text-text-primary">
            Shape living lines with millimeter calm.
          </h1>
          <p className="font-body-small text-[14px] text-text-muted leading-relaxed">
            MaCraft calibrates your real branches, blooms, and vessel into zero-kenzan arrangements grounded in Sōgetsu, Ikenobō, and Ohara geometry.
          </p>
        </div>

        <div className="flex flex-col gap-2.5">
          <div className="rounded-2xl bg-surface-card border border-border-hairline p-3.5 flex items-start gap-3 shadow-2xs">
            <Ruler className="w-4 h-4 text-accent-moss shrink-0 mt-0.5" />
            <div>
              <h2 className="font-body-small text-[13px] font-semibold text-text-primary">
                Ruler-Calibrated Zero-Hallucination Scan
              </h2>
              <p className="font-label-micro text-[11px] text-text-muted mt-0.5 leading-snug">
                Extracts exact millimeter dimensions from your photographed materials without inventing extra stems.
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-surface-card border border-border-hairline p-3.5 flex items-start gap-3 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-accent-moss shrink-0 mt-0.5" />
            <div>
              <h2 className="font-body-small text-[13px] font-semibold text-text-primary">
                Zero-Kenzan Organic Anchoring
              </h2>
              <p className="font-label-micro text-[11px] text-text-muted mt-0.5 leading-snug">
                Builds stable compositions using Komidome twig wedges, Jūji-dome cross-splits, and river stones.
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-surface-card border border-border-hairline p-3.5 flex items-start gap-3 shadow-2xs">
            <Compass className="w-4 h-4 text-accent-moss shrink-0 mt-0.5" />
            <div>
              <h2 className="font-body-small text-[13px] font-semibold text-text-primary">
                2D Azimuth Sandbox &amp; Master Critique
              </h2>
              <p className="font-label-micro text-[11px] text-text-muted mt-0.5 leading-snug">
                Test Shin–Soe–Hikae angles before cutting and earn a Hanko seal on your finished build.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => router.push('/inventory')}
          className="w-full h-[54px] rounded-full bg-primary hover:bg-accent-moss text-on-primary font-body-small text-[15px] font-semibold shadow-sm flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
        >
          <span>Start Your Arrangement</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </main>

      {/* Bottom Contact Footer */}
      <footer className="px-margin py-5 pb-safe border-t border-border-hairline/60 bg-surface-container-low/50 text-center">
        <p className="font-body-small text-[12px] text-text-muted flex items-center justify-center gap-1.5 flex-wrap">
          <span>Questions or Feedback?</span>
          <a
            href="mailto:aliasgertalib@gmail.com?subject=MaCraft%20Feedback"
            className="font-semibold text-accent-moss hover:text-primary underline underline-offset-4 inline-flex items-center gap-1 transition-colors"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>aliasgertalib@gmail.com</span>
          </a>
        </p>
      </footer>
    </div>
  );
}
