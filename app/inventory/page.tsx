'use client';

import React, { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Camera, FolderOpen, X, Pencil, Check,
  ArrowRight, Loader2, Sparkles, AlertCircle, CheckCircle2, FlaskConical,
} from 'lucide-react';
import { useIkebanaStore, InventoryItem, ArrangementOption } from '@/store/useIkebanaStore';
import { compressImageFile } from '@/utils/imageCompression';

const ROLE_OPTIONS: { value: InventoryItem['role']; label: string }[] = [
  { value: 'vessel', label: 'Vessel' },
  { value: 'shin', label: 'Primary Line (Shin)' },
  { value: 'soe', label: 'Secondary (Soe)' },
  { value: 'hikae', label: 'Tertiary (Hikae)' },
  { value: 'anchor', label: 'DIY Anchor' },
  { value: 'foliage', label: 'Foliage' },
];

const ROLE_LABELS: Record<InventoryItem['role'], string> = {
  vessel: 'Vessel', shin: 'Primary Line', soe: 'Secondary',
  hikae: 'Tertiary', anchor: 'DIY Anchor', foliage: 'Foliage',
};

const SAMPLE_INVENTORY: InventoryItem[] = [
  { id: 'sample-vessel-1', name: 'Low Matte-Glaze Ceramic Suiban', role: 'vessel', dimensions: '240mm diameter × 55mm height', naturalCurvatureDegrees: 0, notes: 'Wide water surface ideal for Moribana reflections and stone anchoring.' },
  { id: 'sample-shin-1', name: 'Curved Weeping Willow Branch', role: 'shin', dimensions: '410mm length, 9mm caliper', naturalCurvatureDegrees: 28, notes: 'Supple bark responds well to hand-warmed Tameru shaping.' },
  { id: 'sample-soe-1', name: 'Slender Solomon’s Seal Stem', role: 'soe', dimensions: '275mm length, 6mm caliper', naturalCurvatureDegrees: 18, notes: 'Alternating arching leaves create natural horizontal rhythm.' },
  { id: 'sample-hikae-1', name: 'Rust-Bronze Disbud Chrysanthemum', role: 'hikae', dimensions: '150mm length, 75mm bloom head', naturalCurvatureDegrees: 6, notes: 'Dense focal blossom anchors the foreground triangle.' },
  { id: 'sample-anchor-1', name: 'Flat Basalt River Stones & Forked Twig', role: 'anchor', dimensions: '3 stones (65–85mm) + 190mm forked twig', naturalCurvatureDegrees: 0, notes: 'Provides friction-lock Komidome wedge without a metal kenzan.' },
];

const SAMPLE_ARRANGEMENTS: ArrangementOption[] = [
  {
    styleId: 'moribana-slanted',
    styleTitle: 'Moribana Slanted Form (Keishatai)',
    difficulty: 'Beginner',
    stabilityScore: '95% Anchored',
    diyAnchorMechanism: {
      methodName: 'Komidome Forked-Twig & River Stone Wedge',
      materialsUsed: ['Flat Basalt River Stones & Forked Twig', 'Low Matte-Glaze Ceramic Suiban'],
      setupInstructions: 'Wedge the 190mm forked hardwood twig across the front-left basin quadrant 15mm below water level, locking the willow Shin base between the fork and two 80mm basalt river stones.',
    },
    steps: [
      { stepNumber: 1, title: 'Seat the Komidome Forked-Twig Anchor', estimatedMinutes: 3, requiredTools: ['Hasami Shears', 'Water Pitcher'], description: 'Fill the ceramic suiban with 30mm of cool water. Wedge the forked twig snugly against the inner ceramic wall and brace with two flat basalt stones.', mizukiriCutSpec: 'Bevel both twig ends at 30° to grip interior glaze', tameruTechnique: 'Test firm lateral pressure before inserting woody stems', placementAngles: '25° offset in front-left quadrant, 40mm from rim' },
      { stepNumber: 2, title: 'Establish Shin (Primary Willow Heaven Line)', estimatedMinutes: 4, requiredTools: ['Hasami Shears', 'Submersion Bowl'], description: 'Cut the weeping willow branch underwater to 345mm (1.5× vessel width + height) and lock its base into the twig fork.', mizukiriCutSpec: '45° underwater diagonal cut, 345mm total length', tameruTechnique: 'Warm mid-branch between thumbs and curve +15° forward', placementAngles: '45° forward tilt from vertical, 30° left azimuth' },
      { stepNumber: 3, title: 'Layer Soe (Secondary Solomon’s Seal Line)', estimatedMinutes: 3, requiredTools: ['Hasami Shears'], description: 'Trim Solomon’s Seal to 230mm (two-thirds of Shin) and seat just behind Shin to open breathing room (Ma) over the water.', mizukiriCutSpec: '45° underwater diagonal cut, 230mm total length', tameruTechnique: 'Strip lower 70mm of leaves so none touch the water', placementAngles: '65° forward-left tilt, 50° left azimuth' },
      { stepNumber: 4, title: 'Anchor Hikae (Chrysanthemum Focal Counterweight)', estimatedMinutes: 3, requiredTools: ['Hasami Shears'], description: 'Cut the rust-bronze chrysanthemum to 120mm (one-third of Shin) and wedge against the front basalt stone angling opposite Shin.', mizukiriCutSpec: '45° underwater diagonal cut, 120mm total length', tameruTechnique: 'Tilt bloom face 20° upward toward eye level', placementAngles: '75° forward-right tilt, 45° right azimuth' },
    ],
  },
  {
    styleId: 'moribana-upright',
    styleTitle: 'Moribana Upright Form (Chokuritsutai)',
    difficulty: 'Intermediate',
    stabilityScore: '92% Anchored',
    diyAnchorMechanism: {
      methodName: 'Jūji-dome Cross-Split Base & Stone Collar',
      materialsUsed: ['Curved Weeping Willow Branch', 'Flat Basalt River Stones & Forked Twig'],
      setupInstructions: 'Split the bottom 25mm of the willow trunk into four quadrants, splay open over a flat basalt stone, and ring the base with the remaining two stones.',
    },
    steps: [
      { stepNumber: 1, title: 'Prepare Jūji-dome Cross-Split Trunk', estimatedMinutes: 4, requiredTools: ['Hasami Shears', 'Water Bowl'], description: 'Cut the willow base flat underwater and make two perpendicular 25mm vertical incisions to splay the base over a flat river stone.', mizukiriCutSpec: 'Flat base with 25mm 4-way split, 360mm total length', tameruTechnique: 'Gently straighten lower 100mm for vertical poise', placementAngles: '12° forward tilt from vertical, 15° left azimuth' },
      { stepNumber: 2, title: 'Lock Base with Basalt Stone Collar', estimatedMinutes: 3, requiredTools: ['Water Pitcher'], description: 'Surround the splayed willow foot with two heavy basalt stones in the rear-left quadrant and add 30mm of water.', mizukiriCutSpec: 'No cut required — seat stones flush against splayed foot', tameruTechnique: 'Verify vertical stability under gentle touch', placementAngles: '15° rear-left quadrant anchor position' },
      { stepNumber: 3, title: 'Extend Soe & Hikae Triangle', estimatedMinutes: 4, requiredTools: ['Hasami Shears'], description: 'Insert Solomon’s Seal at 42° left and the chrysanthemum low at 68° right to complete the upright scalene silhouette.', mizukiriCutSpec: '45° underwater cuts: Soe 240mm, Hikae 125mm', tameruTechnique: 'Fan Solomon’s Seal foliage outward from central axis', placementAngles: '42° left tilt (Soe) & 68° right tilt (Hikae)' },
    ],
  },
  {
    styleId: 'jiyuka-freestyle',
    styleTitle: 'Jiyūka Sculptural Tension Freestyle',
    difficulty: 'Advanced',
    stabilityScore: '89% Anchored',
    diyAnchorMechanism: {
      methodName: 'Rim-to-Rim Willow Tension Arch',
      materialsUsed: ['Curved Weeping Willow Branch', 'Low Matte-Glaze Ceramic Suiban'],
      setupInstructions: 'Bow the supple willow branch across opposite inner rims of the 240mm suiban so elastic tension holds the arc above the water.',
    },
    steps: [
      { stepNumber: 1, title: 'Shape & Seat Willow Tension Bridge', estimatedMinutes: 5, requiredTools: ['Hasami Shears'], description: 'Notch both ends of the willow branch at 30° and flex it gently into a dramatic low bridge spanning the ceramic basin.', mizukiriCutSpec: '30° notched bevel ends, 310mm span length', tameruTechnique: 'Warm along entire arc to distribute bend evenly', placementAngles: '68° sweeping horizontal arch across water plane' },
      { stepNumber: 2, title: 'Weave Solomon’s Seal & Chrysanthemum Core', estimatedMinutes: 5, requiredTools: ['Hasami Shears'], description: 'Anchor the chrysanthemum low behind the arch fulcrum using a basalt stone and thread Solomon’s Seal vertically through the willow arc.', mizukiriCutSpec: '45° underwater cuts: Stem 250mm, Bloom 110mm', tameruTechnique: 'Contrast vertical stem against horizontal willow bridge', placementAngles: '20° vertical counterpoint through arch center' },
    ],
  },
];

export default function InventoryPage() {
  const router = useRouter();
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const {
    uploadedImages,
    inventory,
    arrangements,
    setUploadedImages,
    setAnalysisResult,
    updateInventoryItem,
    removeInventoryItem,
  } = useIkebanaStore();

  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState<string>('');
  const [draftRole, setDraftRole] = useState<InventoryItem['role']>('vessel');
  const [draftDimensions, setDraftDimensions] = useState<string>('');
  const [draftNotes, setDraftNotes] = useState<string>('');

  const startEditing = (item: InventoryItem) => {
    setEditingId(item.id);
    setDraftName(item.name);
    setDraftRole(item.role);
    setDraftDimensions(item.dimensions);
    setDraftNotes(item.notes || '');
  };

  const saveEdit = (id: string) => {
    updateInventoryItem(id, {
      name: draftName.trim() || 'Unnamed Element',
      role: draftRole,
      dimensions: draftDimensions.trim() || 'Standard size',
      notes: draftNotes.trim(),
    });
    setEditingId(null);
  };

  const handleLoadSampleMaterials = () => {
    setErrorMessage(null);
    setEditingId(null);
    setUploadedImages([]);
    setAnalysisResult(SAMPLE_INVENTORY, SAMPLE_ARRANGEMENTS);
  };

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setErrorMessage(null);
    setEditingId(null);
    setIsAnalyzing(true);
    try {
      const encodedImages = await Promise.all(
        Array.from(files).map((file) => compressImageFile(file, 1600, 0.84))
      );
      const combinedImages = [...uploadedImages, ...encodedImages];
      setUploadedImages(combinedImages);

      const response = await fetch('/api/analyze-inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: combinedImages }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to analyze material photos.');

      const itemsWithPreview: InventoryItem[] = (data.identifiedItems || []).map((item: InventoryItem) => ({
        ...item,
        imageUrl: encodedImages[0]?.base64,
      }));
      setAnalysisResult(itemsWithPreview, data.arrangements || []);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Unable to process uploaded materials.');
    } finally {
      setIsAnalyzing(false);
      e.target.value = '';
    }
  };

  const vesselCount = inventory.filter((i) => i.role === 'vessel').length;
  const branchCount = inventory.filter((i) => i.role === 'shin').length;
  const stemCount = inventory.filter((i) => ['soe', 'hikae', 'foliage'].includes(i.role)).length;
  const anchorCount = inventory.filter((i) => i.role === 'anchor').length;

  return (
    <div className="bg-surface-base text-text-primary antialiased min-h-screen flex flex-col font-body-regular selection:bg-primary-fixed max-w-[430px] mx-auto w-full relative shadow-xl border-x border-border-hairline/60">
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleFilesSelected} className="hidden" />
      <input ref={galleryInputRef} type="file" accept="image/*" multiple onChange={handleFilesSelected} className="hidden" />

      <header className="sticky top-0 w-full z-40 pt-safe bg-surface-base/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-border-hairline/40">
        <div className="h-14 px-margin flex items-center justify-between">
          <button aria-label="Back" type="button" onClick={() => router.back()} className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-text-primary hover:bg-surface-container active:scale-95 transition-all cursor-pointer">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-serif text-[17px] font-semibold tracking-tight text-text-primary">生け花 · Studio</h1>
          <span className="font-label-micro text-[11px] font-semibold text-accent-moss bg-primary-fixed/80 px-2.5 py-1 rounded-full">Step 1 of 3: Inventory</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col px-margin pt-4 pb-36 gap-5">
        <section className="relative rounded-2xl border-2 border-dashed border-border-hairline bg-surface-card p-5 flex flex-col items-center text-center shadow-xs">
          <div className="w-13 h-13 rounded-full bg-primary-fixed flex items-center justify-center mb-3">
            {isAnalyzing ? <Loader2 className="w-6 h-6 text-accent-moss animate-spin" /> : <Camera className="w-6 h-6 text-accent-moss" />}
          </div>
          <h2 className="font-serif text-[18px] font-semibold text-text-primary">
            {isAnalyzing ? 'Isolating Botanical Elements...' : 'Capture or Upload Your Materials'}
          </h2>
          <p className="font-body-small text-[13px] text-text-muted mt-1 max-w-[290px] leading-relaxed">
            {isAnalyzing ? 'Calibrating millimeter scale and isolating botanical elements...' : 'Place a ruler beside your stems, vessel, and stones on a flat neutral surface for exact millimeter sizing.'}
          </p>

          {uploadedImages.length > 0 && (
            <div className="flex items-center gap-2 mt-3 overflow-x-auto max-w-full py-1">
              {uploadedImages.map((img, idx) => (
                <div key={idx} className="relative w-12 h-12 rounded-xl overflow-hidden border border-border-hairline shrink-0 shadow-xs">
                  <img src={img.base64} alt={`Uploaded material ${idx + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2.5 w-full mt-4">
            <button type="button" disabled={isAnalyzing} onClick={() => cameraInputRef.current?.click()} className="h-11 rounded-full bg-primary text-on-primary font-body-small text-[13px] font-medium flex items-center justify-center gap-2 hover:bg-accent-moss active:scale-95 transition-all cursor-pointer disabled:opacity-50">
              <Camera className="w-4 h-4" />
              <span>Take Photo</span>
            </button>
            <button type="button" disabled={isAnalyzing} onClick={() => galleryInputRef.current?.click()} className="h-11 rounded-full bg-surface-container-low text-text-primary border border-border-hairline font-body-small text-[13px] font-medium flex items-center justify-center gap-2 hover:bg-surface-container active:scale-95 transition-all cursor-pointer disabled:opacity-50">
              <FolderOpen className="w-4 h-4 text-text-muted" />
              <span>Open Gallery</span>
            </button>
          </div>

          <button type="button" disabled={isAnalyzing} onClick={handleLoadSampleMaterials} className="mt-3 text-[12px] font-medium text-accent-moss hover:text-primary inline-flex items-center gap-1.5 underline underline-offset-4 cursor-pointer disabled:opacity-50">
            <FlaskConical className="w-3.5 h-3.5" />
            <span>Load Sample Materials (Demo Kit)</span>
          </button>
        </section>

        {errorMessage && (
          <div className="bg-secondary-fixed/70 border border-accent-vermilion/40 rounded-xl p-3 flex items-start gap-2.5 text-accent-vermilion">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="text-[12px] leading-snug"><span className="font-semibold block">Analysis Error</span><span>{errorMessage}</span></div>
          </div>
        )}

        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="font-subheading-h3 text-[15px] font-semibold text-text-primary">Identified Elements ({inventory.length})</h3>
            <span className="font-label-micro text-[11px] font-medium text-accent-moss bg-primary-fixed/60 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Tap card to refine
            </span>
          </div>

          {inventory.length === 0 ? (
            <div className="rounded-2xl border border-border-hairline bg-surface-container-low/60 p-6 text-center flex flex-col items-center">
              <Sparkles className="w-5 h-5 text-text-muted mb-2" />
              <p className="font-body-small text-[13px] text-text-muted">No materials isolated yet. Snap a photo with a reference ruler, upload from your gallery, or load the sample botanical kit.</p>
              <button type="button" onClick={handleLoadSampleMaterials} className="mt-3.5 px-4 py-2 rounded-full bg-surface-card border border-border-hairline text-text-primary font-body-small text-[12px] font-semibold hover:bg-surface-container active:scale-95 transition-all inline-flex items-center gap-1.5 shadow-2xs cursor-pointer">
                <FlaskConical className="w-3.5 h-3.5 text-accent-moss" />
                <span>Load Sample Materials</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {inventory.map((item) => {
                const isEditing = editingId === item.id;

                if (isEditing) {
                  return (
                    <article
                      key={item.id}
                      className="col-span-2 bg-surface-card rounded-2xl p-4 border-2 border-accent-moss shadow-sm flex flex-col gap-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-label-micro text-[11px] font-bold uppercase tracking-wider text-accent-moss">
                          Refine Material Specs
                        </span>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="text-[11px] font-medium text-text-muted hover:text-text-primary cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>

                      <div className="flex flex-col gap-2.5">
                        <label className="flex flex-col gap-1">
                          <span className="font-label-micro text-[10px] font-semibold uppercase text-text-muted">
                            Ikebana Role
                          </span>
                          <select
                            value={draftRole}
                            onChange={(e) => setDraftRole(e.target.value as InventoryItem['role'])}
                            className="h-9 rounded-xl border border-border-hairline bg-surface-container-low px-2.5 text-[12px] font-medium text-text-primary focus:outline-none focus:border-accent-moss"
                          >
                            {ROLE_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="flex flex-col gap-1">
                          <span className="font-label-micro text-[10px] font-semibold uppercase text-text-muted">
                            Name &amp; Material (e.g. Tall Clear Ribbed Glass Vase)
                          </span>
                          <input
                            type="text"
                            value={draftName}
                            onChange={(e) => setDraftName(e.target.value)}
                            className="h-9 rounded-xl border border-border-hairline bg-surface-container-low px-2.5 text-[12px] font-medium text-text-primary focus:outline-none focus:border-accent-moss"
                          />
                        </label>

                        <label className="flex flex-col gap-1">
                          <span className="font-label-micro text-[10px] font-semibold uppercase text-text-muted">
                            Calibrated Dimensions (mm)
                          </span>
                          <input
                            type="text"
                            value={draftDimensions}
                            onChange={(e) => setDraftDimensions(e.target.value)}
                            className="h-9 rounded-xl border border-border-hairline bg-surface-container-low px-2.5 text-[12px] font-medium text-text-primary focus:outline-none focus:border-accent-moss"
                          />
                        </label>

                        <label className="flex flex-col gap-1">
                          <span className="font-label-micro text-[10px] font-semibold uppercase text-text-muted">
                            Shape, Color &amp; Texture Notes
                          </span>
                          <input
                            type="text"
                            value={draftNotes}
                            onChange={(e) => setDraftNotes(e.target.value)}
                            placeholder="Optional notes for Studio & target render..."
                            className="h-9 rounded-xl border border-border-hairline bg-surface-container-low px-2.5 text-[12px] text-text-primary focus:outline-none focus:border-accent-moss"
                          />
                        </label>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => saveEdit(item.id)}
                          className="h-9 px-4 rounded-full bg-primary hover:bg-accent-moss text-on-primary font-body-small text-[12px] font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Save Changes</span>
                        </button>
                      </div>
                    </article>
                  );
                }

                return (
                  <article
                    key={item.id}
                    onClick={() => startEditing(item)}
                    className="bg-surface-card rounded-2xl p-3 border border-border-hairline hover:border-accent-moss/60 shadow-xs flex flex-col justify-between relative group cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-label-micro text-[10px] font-semibold uppercase tracking-wider text-accent-moss bg-primary-fixed/70 px-2 py-0.5 rounded-full">
                        {ROLE_LABELS[item.role]}
                      </span>
                      <button
                        type="button"
                        aria-label={`Remove ${item.name}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          removeInventoryItem(item.id);
                        }}
                        className="w-6 h-6 rounded-full bg-surface-container-low text-text-muted hover:text-accent-vermilion hover:bg-secondary-fixed/60 flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div>
                      <h4 className="font-body-small text-[13px] font-semibold text-text-primary leading-snug">
                        {item.name}
                      </h4>
                      <p className="font-label-micro text-[11px] text-text-muted mt-0.5">
                        {item.dimensions}
                      </p>
                      {item.notes && (
                        <p className="font-label-micro text-[11px] text-on-surface-variant mt-1 line-clamp-2">
                          {item.notes}
                        </p>
                      )}
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-border-hairline/50 flex items-center justify-between">
                      <span className="font-label-micro text-[10px] font-medium text-text-muted">
                        {item.naturalCurvatureDegrees > 0 ? `Natural Arc: ${item.naturalCurvatureDegrees}°` : 'Solid / Base'}
                      </span>
                      <span className="inline-flex items-center gap-1 font-label-micro text-[10px] font-semibold text-accent-moss">
                        <Pencil className="w-2.5 h-2.5" />
                        <span>Edit</span>
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <aside className="fixed bottom-0 inset-x-0 z-40 bg-surface-base/90 backdrop-blur-md px-margin py-3 pb-safe border-t border-border-hairline/70 max-w-[430px] mx-auto">
        <p className="font-label-micro text-[11px] text-text-muted text-center mb-2">
          {inventory.length > 0 ? `${vesselCount} Vessel · ${branchCount} Branch · ${stemCount} Stems · ${anchorCount} Anchors detected` : 'Upload photos or load sample materials to unlock Studio'}
        </p>
        <button type="button" disabled={inventory.length === 0 || isAnalyzing} onClick={() => router.push('/studio')} className="w-full h-[52px] rounded-full bg-primary hover:bg-accent-moss text-on-primary font-body-small text-[14px] font-semibold shadow-sm flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer disabled:opacity-40 disabled:pointer-events-none">
          <span>Compose Arrangements ({arrangements.length > 0 ? arrangements.length : 3} Styles)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </aside>
    </div>
  );
}
