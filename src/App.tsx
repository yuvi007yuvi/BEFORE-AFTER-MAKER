import React, { useState, useEffect } from 'react';
import { PosterCanvas } from './components/PosterCanvas';
import type { PosterState } from './components/PosterCanvas';
import { ControlPanel } from './components/ControlPanel';
import { SVGS } from './constants/templates';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Sparkles } from 'lucide-react';

const DEFAULT_STATE: PosterState = {
  lang: 'hi',
  gradientStyle: 'light',
  swachBharatLogo: '/swach_bharat.png',
  orgLogo: '/unnamed.png',
  campaignLogo: SVGS.swachhSurvekshanLogo,
  customLeftIllustration: '',
  customRightIllustration: '/worker.png',
  mainTitle: {
    text: 'नगर निगम मथुरा-वृंदावन',
    fontFamily: '"Noto Sans Devanagari"',
    fontSize: 32,
    color: '#0d3c12',
    fontWeight: 'bold',
    align: 'center',
  },
  subtitle: {
    text: 'विशेष सफाई अभियान',
    fontFamily: '"Noto Sans Devanagari"',
    fontSize: 26,
    color: '#ffffff',
    fontWeight: 'bold',
    align: 'center',
  },
  location: {
    text: '',
    fontFamily: '"Noto Sans Devanagari"',
    fontSize: 16,
    color: '#1b5e20',
    fontWeight: 'bold',
    align: 'center',
  },
  footerSlogan: {
    text: 'हम सब ने ठाना है,\nब्रज को स्वच्छ बनाना है',
    fontFamily: '"Noto Sans Devanagari"',
    fontSize: 28,
    color: '#1b5e20',
    fontWeight: 'bold',
    align: 'center',
  },
  beforeImage: {
    src: SVGS.defaultBeforeImage,
    zoom: 1.0,
    xOffset: 0,
    yOffset: 0,
    rotation: 0,
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    sharpen: false,
    shadow: true,
    border: true,
    borderColor: '#e2e8f0',
    borderWidth: 2,
    borderRadius: 12,
  },
  afterImage: {
    src: SVGS.defaultAfterImage,
    zoom: 1.0,
    xOffset: 0,
    yOffset: 0,
    rotation: 0,
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    sharpen: false,
    shadow: true,
    border: true,
    borderColor: '#e2e8f0',
    borderWidth: 2,
    borderRadius: 12,
  },
  decorations: {
    leaves: true,
    broom: true,
    dustbin: true,
    garbageTruck: true,
    sanitationWorker: true,
    curves: true,
    silhouette: true,
    topBanner: true,
    bottomBanner: true,
    shadows: true,
    roundedCorners: true,
  },
  themeColor: '#1b5e20',
  secondaryColor: '#0d3c12',
  posterDesign: 'vrindavan',
  qrcode: {
    visible: false,
    data: 'https://swachhbharatmission.gov.in/',
    x: 85,
    y: 85,
    size: 60,
    rotation: 0,
  },
  watermark: {
    visible: false,
    text: 'नगर निगम मथुरा-वृंदावन',
    opacity: 0.15,
    size: 24,
    rotation: -30,
    x: 50,
    y: 50,
  },
};

function App() {
  const [state, setState] = useState<PosterState>(DEFAULT_STATE);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [canvasScale, setCanvasScale] = useState<number>(0.75);

  // Auto-fit canvas scale depending on screen width
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        if (window.innerWidth < 640) setCanvasScale(0.38);
        else setCanvasScale(0.55);
      } else {
        setCanvasScale(0.75);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);



  // Export to Image (PNG / JPG) or PDF (Print ready, 300 DPI approx)
  const handleExport = async (format: 'png' | 'jpg' | 'pdf') => {
    const element = document.getElementById('poster-canvas-export-target');
    if (!element) return;

    // Temporarily reset scaling for full-size pixel export
    const originalTransform = element.style.transform;
    const originalShadow = element.style.boxShadow;
    const originalBorderRadius = element.style.borderRadius;

    element.style.transform = 'none';
    element.style.boxShadow = 'none';
    element.style.borderRadius = '0px';

    // Wait for styling reset
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      // 300 DPI render requires high scale capture
      const scale = format === 'pdf' ? 3 : 2.5; 
      const canvas = await html2canvas(element, {
        useCORS: true,
        scale: scale,
        backgroundColor: null,
        logging: false,
        onclone: (clonedDoc: Document) => {
          // Surgically remove ONLY css rules containing oklab/oklch 
          // DO NOT disable entire stylesheets — that kills all Tailwind layout
          for (let i = 0; i < clonedDoc.styleSheets.length; i++) {
            const sheet = clonedDoc.styleSheets[i];
            try {
              const rules = sheet.cssRules;
              if (!rules) continue;
              // Walk backwards so index stays valid after deletion
              for (let j = rules.length - 1; j >= 0; j--) {
                const text = rules[j].cssText;
                if (text.includes('oklab') || text.includes('oklch')) {
                  sheet.deleteRule(j);
                }
              }
            } catch (_e) { /* cross-origin stylesheet — skip */ }
          }
        },
      });

      if (format === 'pdf') {
        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        // Create custom portrait PDF matching 4:5 aspect ratio (210mm x 262.5mm)
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: [210, 262.5]
        });
        pdf.addImage(imgData, 'JPEG', 0, 0, 210, 262.5);
        pdf.save(`Campaign_Poster_${Date.now()}.pdf`);
      } else {
        const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
        const imgData = canvas.toDataURL(mimeType, 1.0);
        const link = document.createElement('a');
        link.href = imgData;
        link.download = `Campaign_Poster_${Date.now()}.${format}`;
        link.click();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to export image. Please try again.");
    } finally {
      // Restore scaling
      element.style.transform = originalTransform;
      element.style.boxShadow = originalShadow;
      element.style.borderRadius = originalBorderRadius;
    }
  };

  const handleSaveProject = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
    const link = document.createElement('a');
    link.setAttribute("href", dataStr);
    link.setAttribute("download", `ba_campaign_project_${Date.now()}.json`);
    link.click();
  };

  const handleLoadProject = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          try {
            const parsed = JSON.parse(event.target.result as string);
            setState({ ...DEFAULT_STATE, ...parsed });
          } catch (err) {
            alert("Invalid project file!");
          }
        }
      };
      reader.readAsText(file);
    }
  };

  const handleResetProject = () => {
    if (window.confirm("Are you sure you want to reset the campaign poster?")) {
      setState(DEFAULT_STATE);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-poppins selection:bg-emerald-100">
      {/* Header Banner */}
      <header className="sticky top-0 z-50 glass-panel border-b border-slate-200 px-4 py-3 sm:px-6 flex flex-row justify-between items-center gap-2">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 bg-emerald-600 rounded-xl text-white shadow-sm flex items-center justify-center">
            <Sparkles className="w-4 h-4 sm:w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm sm:text-lg font-bold text-slate-800 tracking-tight leading-none">Before & After</h1>
            <p className="text-[10px] sm:text-xs text-slate-500 font-semibold mt-0.5">Campaign Poster Generator</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">

          <button
            onClick={handleResetProject}
            className="text-[10px] sm:text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl transition-all"
          >
            Reset
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
        
        {/* Left Side (Poster Canvas & Controls) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-6 shadow-sm flex flex-col gap-4 relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Live Interactive Preview</span>
              <div className="flex items-center gap-2">
                {/* Scale Sliders */}
                <div className="flex items-center gap-2 text-xs text-slate-500 border border-slate-200 rounded-lg px-2.5 py-1">
                  <span>Zoom</span>
                  <input
                    type="range"
                    min="0.3"
                    max="1.0"
                    step="0.05"
                    value={canvasScale}
                    onChange={(e) => setCanvasScale(parseFloat(e.target.value))}
                    className="w-20 sm:w-28 accent-emerald-600"
                  />
                  <span className="font-semibold">{Math.round(canvasScale * 100)}%</span>
                </div>
              </div>
            </div>

            {/* Poster Canvas Element */}
            <PosterCanvas
              state={state}
              onChange={setState}
              selectedElement={selectedElement}
              setSelectedElement={setSelectedElement}
              canvasScale={canvasScale}
            />

            <p className="text-[10px] text-slate-400 text-center italic mt-2">
              💡 Tip: Click logos/texts/badges directly to select them. Drag inside the before/after panels to reposition the images.
            </p>
          </div>
        </div>

        {/* Right Side (Settings Panel) */}
        <div className="lg:col-span-1">
          <ControlPanel
            state={state}
            onChange={setState}
            selectedElement={selectedElement}
            setSelectedElement={setSelectedElement}
            onExport={handleExport}
            onSaveProject={handleSaveProject}
            onLoadProject={handleLoadProject}
          />
        </div>
      </main>

      {/* Creative Footer Branding with Developer Credit */}
      <footer className="py-8 border-t border-slate-200 text-center bg-white mt-12 space-y-3">
        <p className="text-xs text-slate-400 font-semibold">
          © 2026 Before & After Campaign Poster Generator. Built for Municipal & Public Swachh Campaigns.
        </p>
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 hover:border-emerald-500/20 hover:shadow-sm transition-all duration-300 group">
            <span className="text-[11px] text-slate-500 font-medium">Developed with</span>
            <span className="text-emerald-600 animate-pulse text-xs">❤️</span>
            <span className="text-[11px] text-slate-500 font-medium">by</span>
            <span className="text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent group-hover:from-emerald-700 group-hover:to-teal-700 transition-all duration-300">
              Yuvraj Singh Tomar
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
