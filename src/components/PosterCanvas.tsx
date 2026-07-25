import React, { useRef, useState } from 'react';
import { SVGS } from '../constants/templates';

export interface ImageSettings {
  src: string;
  zoom: number;
  xOffset: number;
  yOffset: number;
  rotation: number;
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  sharpen: boolean;
  shadow: boolean;
  border: boolean;
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
}

export interface TextStyle {
  text: string;
  fontFamily: string;
  fontSize: number;
  color: string;
  fontWeight: string;
  align: 'left' | 'center' | 'right';
}

export interface PosterState {
  lang: 'hi' | 'en';
  gradientStyle: 'light' | 'dark' | 'midnight' | 'none';
  swachBharatLogo: string;
  orgLogo: string;
  campaignLogo: string;
  customLeftIllustration: string;
  customRightIllustration: string;
  mainTitle: TextStyle;
  subtitle: TextStyle;
  location: TextStyle;
  footerSlogan: TextStyle;
  beforeImage: ImageSettings;
  afterImage: ImageSettings;
  decorations: {
    leaves: boolean;
    broom: boolean;
    dustbin: boolean;
    garbageTruck: boolean;
    sanitationWorker: boolean;
    curves: boolean;
    silhouette: boolean;
    topBanner: boolean;
    bottomBanner: boolean;
    shadows: boolean;
    roundedCorners: boolean;
  };
  themeColor: string;
  secondaryColor: string;
  posterDesign: 'classic' | 'vrindavan' | 'saffron' | 'tricolor' | 'ocean' | 'royal';
  qrcode: {
    visible: boolean;
    data: string;
    x: number; // %
    y: number; // %
    size: number; // px
    rotation: number;
  };
  watermark: {
    visible: boolean;
    text: string;
    opacity: number;
    size: number;
    rotation: number;
    x: number;
    y: number;
  };
}

interface PosterCanvasProps {
  state: PosterState;
  onChange: (updater: (prev: PosterState) => PosterState) => void;
  selectedElement: string | null;
  setSelectedElement: (id: string | null) => void;
  canvasScale: number;
}

export const PosterCanvas: React.FC<PosterCanvasProps> = ({
  state,
  onChange,
  selectedElement,
  setSelectedElement,
  canvasScale,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [imageDragActive, setImageDragActive] = useState<'before' | 'after' | null>(null);

  // Handle Drag & Drop upload for images
  const handleDrop = (e: React.DragEvent, target: 'before' | 'after' | 'orgLogo' | 'campaignLogo' | 'swachBharatLogo' | 'qr') => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const resultStr = event.target.result as string;
          onChange(prev => {
            if (target === 'before') {
              return { ...prev, beforeImage: { ...prev.beforeImage, src: resultStr } };
            } else if (target === 'after') {
              return { ...prev, afterImage: { ...prev.afterImage, src: resultStr } };
            } else if (target === 'swachBharatLogo') {
              return { ...prev, swachBharatLogo: resultStr };
            } else if (target === 'orgLogo') {
              return { ...prev, orgLogo: resultStr };
            } else if (target === 'campaignLogo') {
              return { ...prev, campaignLogo: resultStr };
            } else if (target === 'qr') {
              return { ...prev, qrcode: { ...prev.qrcode, data: resultStr, visible: true } };
            }
            return prev;
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'before' | 'after' | 'orgLogo' | 'campaignLogo' | 'swachBharatLogo' | 'qr') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const resultStr = event.target.result as string;
          onChange(prev => {
            if (target === 'before') {
              return { ...prev, beforeImage: { ...prev.beforeImage, src: resultStr } };
            } else if (target === 'after') {
              return { ...prev, afterImage: { ...prev.afterImage, src: resultStr } };
            } else if (target === 'swachBharatLogo') {
              return { ...prev, swachBharatLogo: resultStr };
            } else if (target === 'orgLogo') {
              return { ...prev, orgLogo: resultStr };
            } else if (target === 'campaignLogo') {
              return { ...prev, campaignLogo: resultStr };
            } else if (target === 'qr') {
              return { ...prev, qrcode: { ...prev.qrcode, data: resultStr, visible: true } };
            }
            return prev;
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Image dragging (panning inside container)
  const handleImageMouseDown = (e: React.MouseEvent, panel: 'before' | 'after') => {
    e.stopPropagation();
    setSelectedElement(panel);
    setDragStart({ x: e.clientX, y: e.clientY });
    setImageDragActive(panel);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragStart || !imageDragActive) return;
    const dx = (e.clientX - dragStart.x) / canvasScale;
    const dy = (e.clientY - dragStart.y) / canvasScale;

    onChange(prev => {
      const imgKey = imageDragActive === 'before' ? 'beforeImage' : 'afterImage';
      const img = prev[imgKey];
      return {
        ...prev,
        [imgKey]: {
          ...img,
          xOffset: img.xOffset + dx,
          yOffset: img.yOffset + dy,
        }
      };
    });

    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setDragStart(null);
    setImageDragActive(null);
  };

  const getImageFilterStyle = (img: ImageSettings) => {
    return {
      filter: `
        brightness(${img.brightness}%)
        contrast(${img.contrast}%)
        saturate(${img.saturation}%)
        blur(${img.blur}px)
        ${img.sharpen ? 'contrast(150%) brightness(95%)' : ''}
      `,
      transform: `scale(${img.zoom}) translate(${img.xOffset}px, ${img.yOffset}px) rotate(${img.rotation}deg)`,
      transition: imageDragActive ? 'none' : 'transform 0.1s ease-out, filter 0.2s ease',
    };
  };

  const isDarkBackground = state.gradientStyle === 'dark' || state.gradientStyle === 'midnight';

  const getHeaderGradient = () => {
    if (!state.decorations.topBanner) return 'transparent';
    switch (state.gradientStyle) {
      case 'dark':
        return `linear-gradient(180deg, ${state.themeColor} 0%, ${state.secondaryColor} 100%)`;
      case 'midnight':
        return `linear-gradient(180deg, #0f172a 0%, #1e293b 100%)`;
      case 'none':
        return 'transparent';
      case 'light':
      default:
        return `linear-gradient(180deg, ${state.themeColor}1c 0%, rgba(255,255,255,0) 100%)`;
    }
  };

  const getFooterGradient = () => {
    if (!state.decorations.bottomBanner) return 'transparent';
    switch (state.gradientStyle) {
      case 'dark':
        return `linear-gradient(0deg, ${state.themeColor} 0%, ${state.secondaryColor} 100%)`;
      case 'midnight':
        return `linear-gradient(0deg, #0f172a 0%, #1e293b 100%)`;
      case 'none':
        return 'transparent';
      case 'light':
      default:
         return `linear-gradient(0deg, ${state.themeColor}1a 0%, rgba(255,255,255,0) 100%)`;
    }
  };

  const getPosterBackground = (): React.CSSProperties => {
    const design = state.posterDesign || 'classic';
    switch (design) {
      case 'vrindavan':
        return {
          background: 'linear-gradient(175deg, #fef9ef 0%, #fff8e1 30%, #e8f5e9 70%, #c8e6c9 100%)',
        };
      case 'saffron':
        return {
          background: 'linear-gradient(180deg, #fff3e0 0%, #ffe0b2 40%, #ffffff 60%, #e8f5e9 100%)',
        };
      case 'tricolor':
        return {
          background: 'linear-gradient(180deg, #ff9933 0%, #ff993310 8%, #ffffff 15%, #ffffff 85%, #13883510 92%, #138835 100%)',
        };
      case 'ocean':
        return {
          background: 'linear-gradient(175deg, #e0f7fa 0%, #b2ebf2 30%, #e0f2f1 60%, #ffffff 100%)',
        };
      case 'royal':
        return {
          background: 'linear-gradient(175deg, #ede7f6 0%, #d1c4e9 25%, #f3e5f5 50%, #fce4ec 75%, #fff3e0 100%)',
        };
      case 'classic':
      default:
        return {
          background: '#ffffff',
        };
    }
  };

  return (
    <div
      className="relative flex items-center justify-center p-4 overflow-hidden border bg-slate-100 rounded-2xl shadow-inner min-h-[400px]"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Sized viewport container wrapper to flow correctly in responsive layout */}
      <div 
        style={{
          width: `${800 * canvasScale}px`,
          height: `${1000 * canvasScale}px`,
        }}
        className="relative overflow-hidden transition-all duration-100 ease-out"
      >
        {/* Target dimensions are now 800x1000 (4:5 portrait aspect ratio) */}
        <div
          id="poster-canvas-export-target"
          ref={containerRef}
          className={`relative select-none shadow-2xl overflow-hidden flex flex-col justify-between`}
          style={{
            width: '800px',
            height: '1000px',
            transform: `scale(${canvasScale})`,
            transformOrigin: 'top left',
            position: 'absolute',
            top: 0,
            left: 0,
            boxShadow: state.decorations.shadows ? '0 25px 50px -12px rgba(0, 0, 0, 0.25)' : 'none',
            borderRadius: state.decorations.roundedCorners ? '24px' : '0px',
            ...getPosterBackground(),
          }}
        >
          {/* Leaves/Feathers Background Decoration */}
          {state.decorations.leaves && (
            <>
              {/* Top Left */}
              <img src="/feather.png" alt="" className="absolute top-6 left-6 w-24 h-24 opacity-35 animate-pulse pointer-events-none rotate-12" />
              {/* Top Right */}
              <img src="/feather.png" alt="" className="absolute top-28 right-16 w-28 h-28 opacity-30 pointer-events-none -rotate-45" />
              {/* Mid Left */}
              <img src="/feather.png" alt="" className="absolute top-80 left-8 w-20 h-20 opacity-20 pointer-events-none rotate-30" />
              {/* Mid Right */}
              <img src="/feather.png" alt="" className="absolute top-[400px] right-8 w-24 h-24 opacity-15 pointer-events-none rotate-[75deg]" />
              {/* Lower Mid Left */}
              <img src="/feather.png" alt="" className="absolute bottom-[280px] left-16 w-24 h-24 opacity-20 pointer-events-none -rotate-12" />
              {/* Lower Mid Right */}
              <img src="/feather.png" alt="" className="absolute bottom-[360px] right-20 w-20 h-20 opacity-15 pointer-events-none rotate-45" />
            </>
          )}

          {/* Temple Silhouette Backdrop */}
          {state.decorations.silhouette && (
            <img 
              src="/temples.png" 
              alt="Temple Silhouette" 
              className="absolute bottom-0 left-0 w-full object-contain opacity-[0.08] pointer-events-none z-0" 
              style={{ maxHeight: '380px' }}
            />
          )}

          {/* Header Region */}
          <div 
            className={`w-full px-8 pt-6 pb-4 flex flex-col items-center relative z-10 transition-all ${
              selectedElement === 'header' ? 'ring-2 ring-emerald-500' : ''
            }`}
            style={{
              background: getHeaderGradient()
            }}
            onClick={(e) => { e.stopPropagation(); setSelectedElement('header'); }}
          >

            {/* Logos Row (White Ribbon) */}
            <div className="flex items-center justify-center gap-6 mb-4 bg-white px-6 py-2 rounded-2xl shadow-sm border border-slate-100/50 mx-auto w-fit">
              {/* Swachh Bharat Logo */}
              <div 
                className="relative w-40 h-24 flex items-center justify-center border border-transparent rounded bg-transparent p-1 hover:border-emerald-500 cursor-pointer"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, 'swachBharatLogo')}
                onClick={(e) => { e.stopPropagation(); setSelectedElement('swachBharatLogo'); }}
              >
                <img src={state.swachBharatLogo || '/swach_bharat.png'} alt="Swachh Bharat Logo" className="max-w-full max-h-full object-contain" />
                <input
                  type="file"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'swachBharatLogo')}
                />
              </div>

              {/* Vertical Divider */}
              <div className="w-[2px] h-16 bg-slate-300" />

              {/* Org Logo */}
              <div 
                className="relative w-40 h-24 flex items-center justify-center border border-transparent rounded bg-transparent p-1 hover:border-emerald-500 cursor-pointer"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, 'orgLogo')}
                onClick={(e) => { e.stopPropagation(); setSelectedElement('orgLogo'); }}
              >
                <img src={state.orgLogo} alt="Org Logo" className="max-w-full max-h-full object-contain" />
                <input
                  type="file"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'orgLogo')}
                />
              </div>

              {/* Vertical Divider */}
              <div className="w-[2px] h-16 bg-slate-300" />

              {/* Campaign Logo */}
              <div 
                className="relative w-40 h-24 flex items-center justify-center border border-transparent rounded bg-transparent p-1 hover:border-emerald-500 cursor-pointer"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, 'campaignLogo')}
                onClick={(e) => { e.stopPropagation(); setSelectedElement('campaignLogo'); }}
              >
                <img src={state.campaignLogo} alt="Campaign Logo" className="max-w-full max-h-full object-contain" />
                <input
                  type="file"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'campaignLogo')}
                />
              </div>
            </div>

            {/* Titles */}
            <div className="text-center w-full">
              <h1 
                style={{
                  fontFamily: state.mainTitle.fontFamily,
                  fontSize: `${state.mainTitle.fontSize}px`,
                  color: isDarkBackground ? '#ffffff' : state.mainTitle.color,
                  fontWeight: state.mainTitle.fontWeight,
                }}
                className="tracking-wide leading-tight outline-none focus:ring-1 focus:ring-emerald-500"
                onClick={(e) => { e.stopPropagation(); setSelectedElement('mainTitle'); }}
              >
                {state.mainTitle.text}
              </h1>

              {/* Subtitle Banner Ribbon */}
              <div className="mt-2 flex justify-center w-full">
                <div 
                  className="ribbon-banner px-12 py-2 flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${state.themeColor} 0%, ${state.secondaryColor} 100%)`
                  }}
                  onClick={(e) => { e.stopPropagation(); setSelectedElement('subtitle'); }}
                >
                  <h2 
                    style={{
                      fontFamily: state.subtitle.fontFamily,
                      fontSize: `${state.subtitle.fontSize}px`,
                      color: state.subtitle.color,
                      fontWeight: state.subtitle.fontWeight,
                    }}
                    className="font-bold tracking-wider text-white"
                  >
                    {state.subtitle.text}
                  </h2>
                </div>
              </div>
            </div>
          </div>

          {/* Before & After Panels */}
          <div className="px-8 grid grid-cols-2 gap-6 relative z-10 my-auto">
            {/* Before Panel */}
            <div 
              className={`relative aspect-[3/4] rounded-xl overflow-hidden border-2 cursor-move ${
                selectedElement === 'before' ? 'border-red-500 ring-2 ring-red-300' : 'border-[#e2e8f0]'
              }`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, 'before')}
              onMouseDown={(e) => handleImageMouseDown(e, 'before')}
            >
              <div className="absolute inset-0 flex items-center justify-center overflow-hidden" style={{ backgroundColor: '#f8fafc' }}>
                <img
                  src={state.beforeImage.src}
                  alt="Before"
                  style={getImageFilterStyle(state.beforeImage)}
                  className="w-full h-full object-cover origin-center pointer-events-none"
                />
              </div>
              {/* Red Before Label */}
              <div className="absolute top-2 left-2 bg-[#dc2626] text-white font-bold px-4 py-1 text-sm rounded shadow-lg uppercase tracking-wider z-20">
                {state.lang === 'hi' ? 'पहले (Before)' : 'Before'}
              </div>
              <input
                type="file"
                id="before-upload"
                className="hidden"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'before')}
              />
            </div>

            {/* Circular Connector Arrow */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
              <img src={SVGS.arrowCircle} alt="" className="w-12 h-12 drop-shadow-md rotate-0" />
            </div>

            {/* After Panel */}
            <div 
              className={`relative aspect-[3/4] rounded-xl overflow-hidden border-2 cursor-move ${
                selectedElement === 'after' ? 'border-emerald-500 ring-2 ring-emerald-300' : 'border-[#e2e8f0]'
              }`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, 'after')}
              onMouseDown={(e) => handleImageMouseDown(e, 'after')}
            >
              <div className="absolute inset-0 flex items-center justify-center overflow-hidden" style={{ backgroundColor: '#f8fafc' }}>
                <img
                  src={state.afterImage.src}
                  alt="After"
                  style={getImageFilterStyle(state.afterImage)}
                  className="w-full h-full object-cover origin-center pointer-events-none"
                />
              </div>
              {/* Green After Label */}
              <div className="absolute top-2 left-2 bg-[#16a34a] text-white font-bold px-4 py-1 text-sm rounded shadow-lg uppercase tracking-wider z-20">
                {state.lang === 'hi' ? 'बाद में (After)' : 'After'}
              </div>
              <input
                type="file"
                id="after-upload"
                className="hidden"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'after')}
              />
            </div>
          </div>

          {/* Location Section */}
          <div className="w-full flex flex-col items-center px-8 mt-2 mb-4 relative z-10">
            <div 
              className="flex items-center gap-2 px-6 py-2 rounded-full border shadow-sm cursor-pointer hover:scale-105 transition-all bg-[#ffffff]"
              style={{ borderColor: state.themeColor }}
              onClick={(e) => { e.stopPropagation(); setSelectedElement('location'); }}
            >
              <img src={SVGS.locationPin} alt="Location" className="w-6 h-6 animate-bounce" />
              <span 
                style={{
                  fontFamily: state.location.fontFamily,
                  fontSize: `${state.location.fontSize}px`,
                  color: state.location.color,
                  fontWeight: state.location.fontWeight,
                }}
                className="text-[#1e293b] tracking-wide"
              >
                {state.location.text || (state.lang === 'hi' ? 'स्थान / वार्ड दर्ज करें' : 'Enter Location / Ward')}
              </span>
            </div>
          </div>

          {/* Slogan Footer & Background Graphics */}
          <div 
            className="w-full relative px-8 py-6 flex items-center justify-between border-t border-[#f1f5f9] min-h-[100px] z-10"
            style={{
              background: getFooterGradient()
            }}
            onClick={(e) => { e.stopPropagation(); setSelectedElement('footer'); }}
          >
            {/* Bottom curve decoration */}
            {state.decorations.curves && (
              <div 
                className="absolute inset-x-0 bottom-0 h-4 -z-10"
                style={{
                  background: `linear-gradient(90deg, ${state.themeColor} 0%, ${state.secondaryColor} 100%)`
                }}
              />
            )}

            {/* Left Graphics (Custom or Default Illustration) */}
            <div className="flex items-center gap-4 min-w-[100px] justify-start">
              {state.customLeftIllustration ? (
                <img src={state.customLeftIllustration} alt="Left Graphic" className="w-24 h-24 object-contain hover:scale-110 transition-all pointer-events-auto" />
              ) : state.decorations.sanitationWorker ? (
                <img src={SVGS.sanitationWorkerIcon} alt="Sanitation Worker" className="w-24 h-24 object-contain hover:scale-110 transition-all pointer-events-auto" />
              ) : null}
            </div>

            {/* Middle Slogan Text with Flute & Peacock Feather */}
            <div className="flex-1 text-center px-4 flex flex-col items-center gap-1">
              <img src={SVGS.krishnaFlute} alt="Bansuri & Mor Pankh" className="w-56 h-14 object-contain hover:scale-105 transition-all pointer-events-auto mb-1" />
              <p 
                style={{
                  fontFamily: state.footerSlogan.fontFamily,
                  fontSize: `${state.footerSlogan.fontSize}px`,
                  color: isDarkBackground ? '#ffffff' : state.footerSlogan.color,
                  fontWeight: state.footerSlogan.fontWeight,
                }}
                className="whitespace-pre-line leading-relaxed"
              >
                {state.footerSlogan.text}
              </p>
            </div>

            {/* Right Graphics (Custom or Default Illustration) */}
            <div className="flex items-center gap-4 min-w-[100px] justify-end">
              {state.customRightIllustration ? (
                <img src={state.customRightIllustration} alt="Right Graphic" className="w-24 h-24 object-contain hover:scale-110 transition-all pointer-events-auto" />
              ) : state.decorations.sanitationWorker ? (
                <img src={SVGS.sanitationWorkerIcon} alt="Sanitation Worker" className="w-24 h-24 object-contain hover:scale-110 transition-all pointer-events-auto" />
              ) : null}
            </div>
          </div>

          {/* QR Code Layer */}
          {state.qrcode.visible && (
            <div 
              style={{
                left: `${state.qrcode.x}%`,
                top: `${state.qrcode.y}%`,
                transform: `translate(-50%, -50%) rotate(${state.qrcode.rotation}deg)`,
                width: `${state.qrcode.size}px`,
                height: `${state.qrcode.size}px`,
              }}
              className={`absolute z-40 bg-[#ffffff] p-1 border shadow-lg cursor-pointer ${
                selectedElement === 'qrcode' ? 'ring-2 ring-emerald-500' : ''
              }`}
              onClick={(e) => { e.stopPropagation(); setSelectedElement('qrcode'); }}
            >
              <img src={state.qrcode.data} alt="QR Code" className="w-full h-full object-contain" />
            </div>
          )}

          {/* Watermark Layer */}
          {state.watermark.visible && (
            <div 
              style={{
                left: `${state.watermark.x}%`,
                top: `${state.watermark.y}%`,
                transform: `translate(-50%, -50%) rotate(${state.watermark.rotation}deg)`,
                opacity: state.watermark.opacity,
                fontSize: `${state.watermark.size}px`,
              }}
              className="absolute z-50 select-none pointer-events-none font-bold text-[#94a3b8] whitespace-nowrap tracking-widest text-center"
            >
              {state.watermark.text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
