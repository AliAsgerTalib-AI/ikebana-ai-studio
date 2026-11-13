'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Scissors,
  Compass,
  Waves,
  Anchor,
  CheckCircle2,
  Clock,
  Wrench,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  useIkebanaStore,
  ArrangementOption,
  ArrangementStep,
} from '@/store/useIkebanaStore';

// Fallback steps if user opens /workbench directly before analyzing photos
const FALLBACK_WORKBENCH_PLAN: ArrangementOption = {
  styleId: 'moribana-slanted',
  styleTitle: 'Moribana Slanted Form (Keishatai)',
  difficulty: 'Beginner',
  stabilityScore: '94% Anchored',
  diyAnchorMechanism: {
    methodName: 'River-Stone & Forked-Twig Wedge (Komidome)',
    materialsUsed: ['Flat River Stones', 'Forked Hardwood Crossbar'],
    setupInstructions:
      'Wedge a forked branch across the inner basin rim 15mm below water level, locking the Shin stem base against two heavy river stones.',
  },
  steps: [
    {
      stepNumber: 1,
      title: 'Seat the Organic Anchor Mechanism',
      estimatedMinutes: 3,
      requiredTools: ['Hasami Shears', 'Shallow Water Basin'],
      description:
        'Fill the vessel with 25mm of cool water and wedge your organic anchor in the front-left quadrant to establish a stable fulcrum.',
      mizukiriCutSpec: 'Trim crossbar ends at 30° bevel to grip interior wall',
      tameruTechnique: 'Test firm lateral pressure before inserting woody stems',
      placementAngles: 'Anchor seated 35mm off-center toward front-left rim',
    },
    {
      stepNumber: 2,
      title: 'Prepare & Seat Shin (Primary Heaven Line)',
      estimatedMinutes: 4,
      requiredTools: ['Hasami Shears', 'Water Bowl'],
      description:
        'Submerge the primary branch base in water while cutting to preserve vascular suction, then shape a graceful upward sweep.',
      mizukiriCutSpec: '45° underwater diagonal cut, 320mm total length',
      tameruTechnique: 'Warm bark between thumbs and bend +15° gently toward viewer',
      placementAngles: '45° forward tilt from vertical, 30° left azimuth',
    },
    {
      stepNumber: 3,
      title: 'Balance Soe (Secondary Man Line)',
      estimatedMinutes: 3,
      requiredTools: ['Hasami Shears'],
      description:
        'Cut the secondary stem to roughly two-thirds of Shin height and insert slightly behind and to the left of Shin to open Ma negative space.',
      mizukiriCutSpec: '45° underwater diagonal cut, 215mm total length',
      tameruTechnique: 'Curve mid-stem outward +10° to echo Shin’s primary arc',
      placementAngles: '65° forward-left tilt, 45° left azimuth',
    },
    {
      stepNumber: 4,
      title: 'Anchor Hikae (Tertiary Focal Counterweight)',
      estimatedMinutes: 3,
      requiredTools: ['Hasami Shears'],
      description:
        'Trim your focal bloom or low foliage to one-third of Shin height and angle toward the opposite front-right quadrant to complete the scalene triangle.',
      mizukiriCutSpec: '45° underwater diagonal cut, 115mm total length',
      tameruTechnique: 'Remove submerged lower leaves to keep water pristine',
      placementAngles: '75° forward-right tilt, 50° right azimuth',
    },
  ],
};

export default function WorkbenchPage() {
  const router = useRouter();

  const {
    arrangements,
    selectedStyleId,
    activeStep,
    setActiveStep,
  } = useIkebanaStore();

  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const currentPlan = useMemo(() => {
    if (!arrangements || arrangements.length === 0) {
      return FALLBACK_WORKBENCH_PLAN;
    }
    return (
      arrangements.find((a) => a.styleId === selectedStyleId) || arrangements[0]
    );
  }, [arrangements, selectedStyleId]);

  const steps: ArrangementStep[] =
    currentPlan.steps && currentPlan.steps.length > 0
      ? currentPlan.steps
      : FALLBACK_WORKBENCH_PLAN.steps;

  const safeStepNumber = Math.min(Math.max(activeStep, 1), steps.length);
  const currentStepData =
    steps.find((s) => s.stepNumber === safeStepNumber) || steps[0];

  const isCurrentStepCompleted = completedSteps.includes(
    currentStepData.stepNumber
  );

  const toggleStepComplete = (stepNum: number) => {
    setCompletedSteps((prev) =>
      prev.includes(stepNum)
        ? prev.filter((n) => n !== stepNum)
        : [...prev, stepNum]
    );
  };

  const handleNextOrCritique = () => {
    if (!completedSteps.includes(currentStepData.stepNumber)) {
      setCompletedSteps((prev) => [...prev, currentStepData.stepNumber]);
    }
    if (safeStepNumber < steps.length) {
      setActiveStep(safeStepNumber + 1);
    } else {
      router.push('/critique');
    }
  };

  // Parse approximate tilt angle from placementAngles string for the live SVG protractor
  const parsedTiltDegrees = useMemo(() => {
    const match = currentStepData.placementAngles?.match(/(\d+)\s*°/);
    if (!match) return 45;
    const val = parseInt(match[1], 10);
    return Math.min(Math.max(val, 5), 85);
  }, [currentStepData.placementAngles]);

  // Compute protractor vector endpoint from vertical axis (0° = straight up, 90° = horizontal right)
  const protractorEndpoint = useMemo(() => {
    const rad = (parsedTiltDegrees * Math.PI) / 180;
    const radius = 64;
    const originX = 56;
    const originY = 82;
    const endX = originX + Math.sin(rad) * radius;
    const endY = originY - Math.cos(rad) * radius;
    return { x: endX.toFixed(1), y: endY.toFixed(1) };
  }, [parsedTiltDegrees]);

  return (
    <div className="bg-surface-base text-text-primary antialiased min-h-screen flex flex-col font-body-regular selection:bg-primary-fixed max-w-[430px] mx-auto w-full relative shadow-xl border-x border-border-hairline/60">
      {/* Sticky Top App Bar */}
      <header className="sticky top-0 w-full z-40 pt-safe bg-surface-base/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-border-hairline/40">
        <div className="h-14 px-margin flex items-center justify-between">
          <button
            aria-label="Back to Studio"
            type="button"
            onClick={() => router.push('/studio')}
            className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-text-primary hover:bg-surface-container active:scale-95 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <h1 className="font-serif text-[17px] font-semibold tracking-tight text-text-primary">
            生け花 · Workbench
          </h1>

          <span className="font-label-micro text-[11px] font-semibold text-accent-moss bg-primary-fixed/80 px-2.5 py-1 rounded-full">
            Step 3 of 3: Craft
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col px-margin pt-4 pb-36 gap-4">
        {/* Active Style & Anchor Reference Pill */}
        <section className="bg-surface-container-low rounded-2xl p-3 border border-border-hairline/80 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="font-label-micro text-[10px] font-semibold uppercase tracking-wider text-accent-moss">
              {currentPlan.styleTitle}
            </p>
            <p className="font-body-small text-[12px] font-medium text-text-primary truncate mt-0.5 flex items-center gap-1.5">
              <Anchor className="w-3.5 h-3.5 text-accent-moss shrink-0" />
              <span>{currentPlan.diyAnchorMechanism.methodName}</span>
            </p>
          </div>
          <span className="font-label-micro text-[11px] font-semibold text-text-muted shrink-0">
            {completedSteps.length}/{steps.length} Done
          </span>
        </section>

        {/* Horizontal Step Scrubber Pills */}
        <section className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {steps.map((step) => {
            const isSelected = step.stepNumber === safeStepNumber;
            const isDone = completedSteps.includes(step.stepNumber);
            return (
              <button
                key={step.stepNumber}
                type="button"
                onClick={() => setActiveStep(step.stepNumber)}
                className={`px-3.5 py-2 rounded-full text-[12px] font-medium flex items-center gap-1.5 transition-all shrink-0 cursor-pointer border ${
                  isSelected
                    ? 'bg-primary text-on-primary border-primary shadow-xs'
                    : isDone
                    ? 'bg-primary-fixed/70 text-accent-moss border-accent-moss/30'
                    : 'bg-surface-card text-text-muted border-border-hairline hover:text-text-primary'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <span className="font-semibold">#{step.stepNumber}</span>
                )}
                <span className="max-w-[120px] truncate">{step.title}</span>
              </button>
            );
          })}
        </section>

        {/* Active Step Instruction Hero Card */}
        <section className="bg-surface-card rounded-3xl p-5 border border-border-hairline shadow-sm flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="font-label-micro text-[11px] font-semibold uppercase tracking-wider text-accent-moss bg-primary-fixed/80 px-2.5 py-0.5 rounded-full">
              Step {currentStepData.stepNumber} of {steps.length}
            </span>
            <span className="font-label-micro text-[11px] text-text-muted flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{currentStepData.estimatedMinutes} min</span>
            </span>
          </div>

          <h2 className="font-serif text-[20px] font-semibold text-text-primary leading-snug">
            {currentStepData.title}
          </h2>

          <p className="font-body-regular text-[14px] text-on-surface-variant leading-relaxed">
            {currentStepData.description}
          </p>

          {/* Required Tools Tags */}
          {currentStepData.requiredTools?.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="font-label-micro text-[10px] font-semibold uppercase tracking-wider text-text-muted flex items-center gap-1 mr-1">
                <Wrench className="w-3 h-3" />
                Tools:
              </span>
              {currentStepData.requiredTools.map((tool, i) => (
                <span
                  key={i}
                  className="font-label-micro text-[11px] bg-surface-container-low text-text-primary px-2.5 py-0.5 rounded-full border border-border-hairline/70"
                >
                  {tool}
                </span>
              ))}
            </div>
          )}
        </section>

        {/* Tactile Techniques Grid: Mizukiri, Tameru & Polar Angle Protractor */}
        <section className="flex flex-col gap-3">
          {/* 1. Mizukiri Underwater Cut Specification */}
          <article className="bg-surface-card rounded-2xl p-4 border border-border-hairline shadow-xs flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-fixed/80 text-accent-moss flex items-center justify-center shrink-0">
              <Scissors className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-label-micro text-[11px] font-semibold uppercase tracking-wider text-accent-moss">
                  Mizukiri · Underwater Cut
                </h3>
                <span className="font-label-micro text-[10px] text-text-muted">
                  Submerged 45°
                </span>
              </div>
              <p className="font-body-small text-[13px] font-medium text-text-primary mt-1 leading-snug">
                {currentStepData.mizukiriCutSpec}
              </p>
            </div>
          </article>

          {/* 2. Tameru Stem Bending Technique */}
          <article className="bg-surface-card rounded-2xl p-4 border border-border-hairline shadow-xs flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-surface-container-low text-text-primary flex items-center justify-center shrink-0 border border-border-hairline/70">
              <Waves className="w-5 h-5 text-accent-moss" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-label-micro text-[11px] font-semibold uppercase tracking-wider text-text-primary">
                  Tameru · Curvature Shaping
                </h3>
                <span className="font-label-micro text-[10px] text-text-muted">
                  Hand-warmed
                </span>
              </div>
              <p className="font-body-small text-[13px] font-medium text-text-primary mt-1 leading-snug">
                {currentStepData.tameruTechnique}
              </p>
            </div>
          </article>

          {/* 3. Placement Angles & Live Vector Protractor */}
          <article className="bg-surface-card rounded-2xl p-4 border border-border-hairline shadow-xs flex items-center justify-between gap-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-secondary-fixed/70 text-accent-vermilion flex items-center justify-center shrink-0">
                <Compass className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="font-label-micro text-[11px] font-semibold uppercase tracking-wider text-accent-vermilion">
                  Polar Placement Angle
                </h3>
                <p className="font-body-small text-[13px] font-medium text-text-primary mt-1 leading-snug">
                  {currentStepData.placementAngles}
                </p>
              </div>
            </div>

            {/* Live Angle Protractor Gauge */}
            <div className="w-[104px] h-[94px] rounded-xl bg-surface-base border border-border-hairline/80 shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 112 96" className="w-full h-full">
                {/* Plumb Vertical Reference (0°) */}
                <line
                  x1="56"
                  y1="14"
                  x2="56"
                  y2="82"
                  stroke="#DEDAD2"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />
                {/* Water Horizon Reference (90°) */}
                <line
                  x1="20"
                  y1="82"
                  x2="96"
                  y2="82"
                  stroke="#6C6B66"
                  strokeWidth="1.5"
                />
                {/* Protractor Quarter Arc */}
                <path
                  d="M 56 34 A 48 48 0 0 1 104 82"
                  fill="none"
                  stroke="#DEDAD2"
                  strokeWidth="1"
                />
                {/* Active Stem Angle Vector */}
                <line
                  x1="56"
                  y1="82"
                  x2={protractorEndpoint.x}
                  y2={protractorEndpoint.y}
                  stroke="#BD4B37"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <circle cx="56" cy="82" r="3.5" fill="#2D3E32" />
                <text
                  x="12"
                  y="24"
                  className="text-[10px] font-bold fill-accent-vermilion"
                >
                  {parsedTiltDegrees}°
                </text>
              </svg>
            </div>
          </article>
        </section>

        {/* Mark Step Complete Toggle */}
        <button
          type="button"
          onClick={() => toggleStepComplete(currentStepData.stepNumber)}
          className={`w-full py-3 px-4 rounded-2xl border text-[13px] font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
            isCurrentStepCompleted
              ? 'bg-primary-fixed/80 border-accent-moss/40 text-accent-moss'
              : 'bg-surface-card border-border-hairline text-text-primary hover:bg-surface-container-low'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>
            {isCurrentStepCompleted
              ? `Step ${currentStepData.stepNumber} Completed`
              : `Mark Step ${currentStepData.stepNumber} Complete`}
          </span>
        </button>
      </main>

      {/* Sticky Bottom Navigation Dock */}
      <aside className="fixed bottom-0 inset-x-0 z-40 bg-surface-base/90 backdrop-blur-md px-margin py-3 pb-safe border-t border-border-hairline/70 max-w-[430px] mx-auto">
        <div className="flex items-center gap-2.5">
          {/* Previous Step Button */}
          <button
            type="button"
            disabled={safeStepNumber <= 1}
            onClick={() => setActiveStep(safeStepNumber - 1)}
            aria-label="Previous Step"
            className="w-12 h-[52px] rounded-full bg-surface-card border border-border-hairline text-text-primary flex items-center justify-center hover:bg-surface-container active:scale-95 transition-all cursor-pointer disabled:opacity-35 disabled:pointer-events-none shrink-0"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Primary Next Step / Proceed to Critique Button */}
          <button
            type="button"
            onClick={handleNextOrCritique}
            className="flex-1 h-[52px] rounded-full bg-primary hover:bg-accent-moss text-on-primary font-body-small text-[14px] font-semibold shadow-sm flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
          >
            {safeStepNumber < steps.length ? (
              <>
                <span>Next Step ({safeStepNumber + 1} of {steps.length})</span>
                <ChevronRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Finish &amp; Critique Arrangement</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </aside>
    </div>
  );
}
