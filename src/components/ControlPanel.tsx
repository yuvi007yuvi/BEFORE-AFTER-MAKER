import React, { useState, useEffect } from 'react';
import type { PosterState } from './PosterCanvas';
import { CAMPAIGN_PRESETS, TEMPLATE_LIBRARY } from '../constants/templates';
import type { CampaignPreset } from '../constants/templates';
import { Layout, FileText, Image as ImageIcon, Settings } from 'lucide-react';

interface ControlPanelProps {
  state: PosterState;
  onChange: (updater: (prev: PosterState) => PosterState) => void;
  selectedElement: string | null;
  setSelectedElement: (id: string | null) => void;
  onExport: (format: 'png' | 'jpg' | 'pdf') => void;
  onSaveProject: () => void;
  onLoadProject: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  state,
  onChange,
  selectedElement,
  setSelectedElement,
  onExport,
  onSaveProject,
  onLoadProject,
}) => {
  const [activeTab, setActiveTab] = useState<'templates' | 'text' | 'images' | 'decorations'>('templates');
  const [qrText, setQrText] = useState('https://swachhbharatmission.gov.in/');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleImageSettingChange = (panel: 'before' | 'after', key: string, value: any) => {
    onChange(prev => {
      const imgKey = panel === 'before' ? 'beforeImage' : 'afterImage';
      return {
        ...prev,
        [imgKey]: { ...prev[imgKey], [key]: value }
      };
    });
  };

  if (isMobile) {
    return (
      <div className="w-full flex flex-col bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden p-4 space-y-4">
        <h2 className="font-bold text-slate-800 text-sm border-b pb-2 mb-2 uppercase tracking-wide text-center">Mobile Campaign Editor</h2>
        
        {/* Upload Before Image */}
        <div className="space-y-1">
          <span className="text-xs font-bold text-slate-500 block">1. BEFORE IMAGE (पहले)</span>
          <div className="relative border-2 border-dashed border-slate-200 rounded-xl p-3 flex flex-col items-center justify-center hover:bg-slate-50 cursor-pointer min-h-[100px]">
            {state.beforeImage.src && !state.beforeImage.src.startsWith('data:image/svg+xml') ? (
              <div className="flex items-center gap-3 w-full">
                <img src={state.beforeImage.src} className="w-16 h-20 object-cover rounded-lg border" alt="Before" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-emerald-600 font-semibold">Image Uploaded</p>
                  <p className="text-[10px] text-slate-400">Tap to replace image</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-2">
                <p className="text-xs text-slate-500 font-medium">Select Before Image</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Camera / Gallery</p>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    if (event.target?.result) {
                      handleImageSettingChange('before', 'src', event.target.result as string);
                    }
                  };
                  reader.readAsDataURL(file);
                }
              }}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
          </div>
        </div>

        {/* Upload After Image */}
        <div className="space-y-1">
          <span className="text-xs font-bold text-slate-500 block">2. AFTER IMAGE (बाद में)</span>
          <div className="relative border-2 border-dashed border-slate-200 rounded-xl p-3 flex flex-col items-center justify-center hover:bg-slate-50 cursor-pointer min-h-[100px]">
            {state.afterImage.src && !state.afterImage.src.startsWith('data:image/svg+xml') ? (
              <div className="flex items-center gap-3 w-full">
                <img src={state.afterImage.src} className="w-16 h-20 object-cover rounded-lg border" alt="After" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-emerald-600 font-semibold">Image Uploaded</p>
                  <p className="text-[10px] text-slate-400">Tap to replace image</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-2">
                <p className="text-xs text-slate-500 font-medium">Select After Image</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Camera / Gallery</p>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    if (event.target?.result) {
                      handleImageSettingChange('after', 'src', event.target.result as string);
                    }
                  };
                  reader.readAsDataURL(file);
                }
              }}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
          </div>
        </div>

        {/* Download Buttons Block */}
        <div className="pt-4 border-t border-slate-100 space-y-2">
          <span className="text-xs font-bold text-slate-500 block text-center uppercase mb-1">Download Campaign Poster</span>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => onExport('png')}
              className="py-2.5 px-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-sm transition-all text-center"
            >
              PNG Image
            </button>
            <button
              onClick={() => onExport('jpg')}
              className="py-2.5 px-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-sm transition-all text-center"
            >
              JPG Image
            </button>
            <button
              onClick={() => onExport('pdf')}
              className="py-2.5 px-1 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs shadow-sm transition-all text-center"
            >
              PDF Print
            </button>
          </div>
        </div>
      </div>
    );
  }

  const fonts = {
    hi: [
      { name: 'Noto Sans Devanagari', value: '"Noto Sans Devanagari"' },
      { name: 'Mukta', value: 'Mukta' },
      { name: 'Hind', value: 'Hind' },
    ],
    en: [
      { name: 'Poppins', value: 'Poppins' },
      { name: 'Roboto', value: 'Roboto' },
      { name: 'Montserrat', value: 'Montserrat' },
    ],
  };

  const handleTextChange = (field: 'mainTitle' | 'subtitle' | 'location' | 'footerSlogan', value: string) => {
    onChange(prev => ({
      ...prev,
      [field]: { ...prev[field], text: value }
    }));
  };

  const handleStyleChange = (field: 'mainTitle' | 'subtitle' | 'location' | 'footerSlogan', key: string, value: any) => {
    onChange(prev => ({
      ...prev,
      [field]: { ...prev[field], [key]: value }
    }));
  };

  const applyPreset = (preset: CampaignPreset) => {
    onChange(prev => ({
      ...prev,
      themeColor: preset.primaryColor,
      secondaryColor: preset.secondaryColor,
      orgLogo: preset.orgLogo,
      campaignLogo: preset.campaignLogo,
      decorations: { ...preset.decorations },
      mainTitle: { ...prev.mainTitle, text: preset.title, color: preset.primaryColor },
      subtitle: { ...prev.subtitle, text: preset.subtitle },
      footerSlogan: { ...prev.footerSlogan, text: preset.footerSlogan },
    }));
  };

  const generateQRCode = async () => {
    try {
      const url = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrText)}`;
      onChange(prev => ({
        ...prev,
        qrcode: {
          ...prev.qrcode,
          data: url,
          visible: true,
        }
      }));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-full lg:w-96 flex flex-col bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden h-fit">
      {/* Tab Selectors */}
      <div className="flex border-b border-slate-200 bg-slate-50/50">
        {[
          { id: 'templates', label: 'Presets', icon: Layout },
          { id: 'text', label: 'Texts', icon: FileText },
          { id: 'images', label: 'Images', icon: ImageIcon },
          { id: 'decorations', label: 'Decorations', icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-3 px-1 text-xs font-semibold flex flex-col items-center gap-1 border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-emerald-600 text-emerald-700 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="p-5 max-h-[calc(100vh-280px)] overflow-y-auto space-y-5">
        {/* Tab 1: Templates / Presets */}
        {activeTab === 'templates' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Campaign Language</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onChange(prev => ({ ...prev, lang: 'hi' }))}
                  className={`py-2 px-3 text-sm font-semibold rounded-lg border transition-all ${
                    state.lang === 'hi' ? 'border-emerald-600 bg-emerald-50 text-emerald-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  हिन्दी (Hindi)
                </button>
                <button
                  onClick={() => onChange(prev => ({ ...prev, lang: 'en' }))}
                  className={`py-2 px-3 text-sm font-semibold rounded-lg border transition-all ${
                    state.lang === 'en' ? 'border-emerald-600 bg-emerald-50 text-emerald-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  English
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Campaign Preset Themes</label>
              <div className="space-y-2">
                {CAMPAIGN_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => applyPreset(preset)}
                    className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/10 transition-all flex items-center justify-between"
                  >
                    <div>
                      <span className="font-semibold text-sm block text-slate-800">{preset.name}</span>
                      <span className="text-xs text-slate-400">{preset.theme}</span>
                    </div>
                    <div className="flex gap-1">
                      <span className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.primaryColor }} />
                      <span className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.secondaryColor }} />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Template Library Preset</label>
              <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
                {TEMPLATE_LIBRARY.map((tpl) => (
                  <button
                    key={tpl.id}
                    onClick={() => {
                      const preset = CAMPAIGN_PRESETS.find(p => p.id === tpl.presetId) || CAMPAIGN_PRESETS[0];
                      onChange(prev => ({
                        ...prev,
                        themeColor: preset.primaryColor,
                        secondaryColor: preset.secondaryColor,
                        orgLogo: preset.orgLogo,
                        campaignLogo: preset.campaignLogo,
                        mainTitle: { ...prev.mainTitle, text: tpl.title, color: preset.primaryColor },
                        subtitle: { ...prev.subtitle, text: tpl.subtitle }
                      }));
                    }}
                    className="text-left p-2.5 rounded-lg border border-slate-100 hover:border-emerald-500 hover:bg-slate-50 text-xs transition-all"
                  >
                    <span className="font-medium text-slate-700 block">{tpl.name}</span>
                    <span className="text-slate-400 text-[10px]">{tpl.category}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Texts */}
        {activeTab === 'text' && (
          <div className="space-y-4">
            {/* Element Selection Helper */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
              <span className="text-slate-500 font-medium">Tip: Click on any text inside the poster to highlight and edit it directly here!</span>
            </div>

            {[
              { id: 'mainTitle', label: 'Main Title / Organization' },
              { id: 'subtitle', label: 'Subtitle / Campaign' },
              { id: 'location', label: 'Ward / Location Badge' },
              { id: 'footerSlogan', label: 'Footer Slogan' },
            ].map((textEl) => {
              const elId = textEl.id as 'mainTitle' | 'subtitle' | 'location' | 'footerSlogan';
              const textObj = state[elId];
              const isSelected = selectedElement === elId;

              return (
                <div key={elId} className={`p-3 rounded-xl border transition-all ${isSelected ? 'border-emerald-500 bg-emerald-50/10' : 'border-slate-200'}`}>
                  <label className="text-xs font-bold text-slate-600 block mb-1.5">{textEl.label}</label>
                  <textarea
                    rows={2}
                    value={textObj.text}
                    onChange={(e) => handleTextChange(elId, e.target.value)}
                    onClick={() => setSelectedElement(elId)}
                    className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                  
                  {isSelected && (
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs pt-3 border-t border-slate-100">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Font Family</label>
                        <select
                          value={textObj.fontFamily}
                          onChange={(e) => handleStyleChange(elId, 'fontFamily', e.target.value)}
                          className="w-full border border-slate-200 rounded p-1"
                        >
                          {fonts[state.lang].map((f) => (
                            <option key={f.value} value={f.value}>{f.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Font Size (px)</label>
                        <input
                          type="number"
                          value={textObj.fontSize}
                          onChange={(e) => handleStyleChange(elId, 'fontSize', parseInt(e.target.value))}
                          className="w-full border border-slate-200 rounded p-1"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Color</label>
                        <input
                          type="color"
                          value={textObj.color}
                          onChange={(e) => handleStyleChange(elId, 'color', e.target.value)}
                          className="w-full h-7 rounded border border-slate-200 p-0.5 cursor-pointer"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Weight</label>
                        <select
                          value={textObj.fontWeight}
                          onChange={(e) => handleStyleChange(elId, 'fontWeight', e.target.value)}
                          className="w-full border border-slate-200 rounded p-1"
                        >
                          <option value="normal">Normal</option>
                          <option value="medium">Medium</option>
                          <option value="bold">Bold</option>
                          <option value="900">Heavy</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 3: Images */}
        {activeTab === 'images' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSelectedElement('before')}
                className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                  selectedElement === 'before' ? 'border-red-500 bg-red-50 text-red-800' : 'border-slate-200 text-slate-600'
                }`}
              >
                Before Image
              </button>
              <button
                onClick={() => setSelectedElement('after')}
                className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                  selectedElement === 'after' ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-slate-200 text-slate-600'
                }`}
              >
                After Image
              </button>
            </div>

            {(selectedElement === 'before' || selectedElement === 'after') ? (
              <div className="p-3 border border-slate-200 rounded-xl space-y-3">
                <span className="font-bold text-xs text-slate-700 block uppercase tracking-wider">
                  Editing {selectedElement === 'before' ? 'Before' : 'After'} Image
                </span>

                {/* Upload & Reset Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => document.getElementById(`${selectedElement}-upload`)?.click()}
                    className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 rounded-lg transition-all"
                  >
                    Replace Image
                  </button>
                  <button
                    onClick={() => {
                      const key = selectedElement === 'before' ? 'beforeImage' : 'afterImage';
                      onChange(prev => ({
                        ...prev,
                        [key]: {
                          ...prev[key],
                          zoom: 1,
                          xOffset: 0,
                          yOffset: 0,
                          rotation: 0,
                          brightness: 100,
                          contrast: 100,
                          saturation: 100,
                          blur: 0,
                          sharpen: false,
                        }
                      }));
                    }}
                    className="py-1.5 px-3 border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-600 rounded-lg transition-all"
                  >
                    Reset Fit
                  </button>
                </div>

                {/* Zoom Control */}
                <div>
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Zoom</span>
                    <span>{Math.round(state[selectedElement === 'before' ? 'beforeImage' : 'afterImage'].zoom * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.1"
                    value={state[selectedElement === 'before' ? 'beforeImage' : 'afterImage'].zoom}
                    onChange={(e) => handleImageSettingChange(selectedElement as any, 'zoom', parseFloat(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                </div>

                {/* Rotation Control */}
                <div>
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Rotate</span>
                    <span>{state[selectedElement === 'before' ? 'beforeImage' : 'afterImage'].rotation}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    step="1"
                    value={state[selectedElement === 'before' ? 'beforeImage' : 'afterImage'].rotation}
                    onChange={(e) => handleImageSettingChange(selectedElement as any, 'rotation', parseInt(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                </div>

                {/* Filters */}
                <div className="pt-2 border-t border-slate-100 space-y-3">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Filters & Adjustments</span>
                  
                  {/* Brightness */}
                  <div>
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>Brightness</span>
                      <span>{state[selectedElement === 'before' ? 'beforeImage' : 'afterImage'].brightness}%</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="150"
                      value={state[selectedElement === 'before' ? 'beforeImage' : 'afterImage'].brightness}
                      onChange={(e) => handleImageSettingChange(selectedElement as any, 'brightness', parseInt(e.target.value))}
                      className="w-full accent-emerald-600"
                    />
                  </div>

                  {/* Contrast */}
                  <div>
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>Contrast</span>
                      <span>{state[selectedElement === 'before' ? 'beforeImage' : 'afterImage'].contrast}%</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="150"
                      value={state[selectedElement === 'before' ? 'beforeImage' : 'afterImage'].contrast}
                      onChange={(e) => handleImageSettingChange(selectedElement as any, 'contrast', parseInt(e.target.value))}
                      className="w-full accent-emerald-600"
                    />
                  </div>

                  {/* Saturation */}
                  <div>
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>Saturation</span>
                      <span>{state[selectedElement === 'before' ? 'beforeImage' : 'afterImage'].saturation}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={state[selectedElement === 'before' ? 'beforeImage' : 'afterImage'].saturation}
                      onChange={(e) => handleImageSettingChange(selectedElement as any, 'saturation', parseInt(e.target.value))}
                      className="w-full accent-emerald-600"
                    />
                  </div>

                  {/* Blur */}
                  <div>
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>Blur</span>
                      <span>{state[selectedElement === 'before' ? 'beforeImage' : 'afterImage'].blur}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={state[selectedElement === 'before' ? 'beforeImage' : 'afterImage'].blur}
                      onChange={(e) => handleImageSettingChange(selectedElement as any, 'blur', parseInt(e.target.value))}
                      className="w-full accent-emerald-600"
                    />
                  </div>

                  {/* Auto Enhance / Sharpen */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-slate-600">Auto Quality Enhance</span>
                    <button
                      onClick={() => handleImageSettingChange(selectedElement as any, 'sharpen', !state[selectedElement === 'before' ? 'beforeImage' : 'afterImage'].sharpen)}
                      className={`text-xs px-3 py-1 rounded-full border transition-all ${
                        state[selectedElement === 'before' ? 'beforeImage' : 'afterImage'].sharpen
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      {state[selectedElement === 'before' ? 'beforeImage' : 'afterImage'].sharpen ? 'On' : 'Off'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-slate-400 text-center py-6 border border-dashed border-slate-200 rounded-xl text-xs">
                Select Before or After Image above or on the poster to start editing.
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Decorations & Custom Overlays */}
        {activeTab === 'decorations' && (
          <div className="space-y-4">
            {/* Custom Theme Colors */}
            <div className="p-3 border border-slate-200 rounded-xl space-y-3">
              <span className="font-bold text-xs text-slate-700 block uppercase tracking-wider">Theme Accent Colors</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Primary Color</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={state.themeColor}
                      onChange={(e) => onChange(prev => ({ ...prev, themeColor: e.target.value }))}
                      className="w-8 h-8 rounded border border-slate-200 p-0.5 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={state.themeColor}
                      onChange={(e) => onChange(prev => ({ ...prev, themeColor: e.target.value }))}
                      className="w-full border border-slate-200 rounded p-1 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Secondary Color</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={state.secondaryColor}
                      onChange={(e) => onChange(prev => ({ ...prev, secondaryColor: e.target.value }))}
                      className="w-8 h-8 rounded border border-slate-200 p-0.5 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={state.secondaryColor}
                      onChange={(e) => onChange(prev => ({ ...prev, secondaryColor: e.target.value }))}
                      className="w-full border border-slate-200 rounded p-1 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Gradient Style Selector */}
            <div className="p-3 border border-slate-200 rounded-xl space-y-2">
              <span className="font-bold text-xs text-slate-700 block uppercase tracking-wider mb-2">Top & Bottom Banner Style</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'light', label: 'Light Fade' },
                  { id: 'dark', label: 'Dark Solid' },
                  { id: 'midnight', label: 'Midnight Black' },
                  { id: 'none', label: 'No Banner' },
                ].map((gStyle) => (
                  <button
                    key={gStyle.id}
                    onClick={() => onChange(prev => ({ ...prev, gradientStyle: gStyle.id as any }))}
                    className={`py-1.5 px-2 rounded-lg border font-semibold transition-all ${
                      state.gradientStyle === gStyle.id
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {gStyle.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Footer Illustrations Upload */}
            <div className="p-3 border border-slate-200 rounded-xl space-y-3">
              <span className="font-bold text-xs text-slate-700 block uppercase tracking-wider">Custom Footer Illustrations</span>
              
              <div className="space-y-3 text-xs">
                {/* Left Illustration */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-slate-500 font-semibold">Left Illustration (PNG)</label>
                    {state.customLeftIllustration && (
                      <button
                        onClick={() => onChange(prev => ({ ...prev, customLeftIllustration: '' }))}
                        className="text-[10px] text-red-500 hover:text-red-600 font-semibold"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          if (event.target?.result) {
                            onChange(prev => ({ ...prev, customLeftIllustration: event.target!.result as string }));
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full border border-slate-200 rounded-lg p-1 text-slate-500"
                  />
                </div>

                {/* Right Illustration */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-slate-500 font-semibold">Right Illustration (PNG)</label>
                    {state.customRightIllustration && (
                      <button
                        onClick={() => onChange(prev => ({ ...prev, customRightIllustration: '' }))}
                        className="text-[10px] text-red-500 hover:text-red-600 font-semibold"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          if (event.target?.result) {
                            onChange(prev => ({ ...prev, customRightIllustration: event.target!.result as string }));
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full border border-slate-200 rounded-lg p-1 text-slate-500"
                  />
                </div>
              </div>
            </div>

            {/* Decoration Toggles */}
            <div className="p-3 border border-slate-200 rounded-xl space-y-2">
              <span className="font-bold text-xs text-slate-700 block uppercase tracking-wider mb-2">Enable/Disable Elements</span>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                {[
                  { key: 'leaves', label: 'Flying Leaves' },
                  { key: 'broom', label: 'Broom Icon' },
                  { key: 'dustbin', label: 'Dustbin Icon' },
                  { key: 'garbageTruck', label: 'Garbage Vehicle' },
                  { key: 'sanitationWorker', label: 'Sanitation Worker' },
                  { key: 'curves', label: 'Bottom Curve' },
                  { key: 'silhouette', label: 'Temple Silhouette' },
                  { key: 'topBanner', label: 'Top Banner Banner' },
                  { key: 'shadows', label: 'Poster Shadows' },
                  { key: 'roundedCorners', label: 'Rounded Corners' },
                ].map((dec) => (
                  <label key={dec.key} className="flex items-center gap-2 cursor-pointer py-1">
                    <input
                      type="checkbox"
                      checked={(state.decorations as any)[dec.key]}
                      onChange={(e) => onChange(prev => ({
                        ...prev,
                        decorations: {
                          ...prev.decorations,
                          [dec.key]: e.target.checked
                        }
                      }))}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-slate-600 font-medium">{dec.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* QR Code Segment */}
            <div className="p-3 border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-700 uppercase tracking-wider">QR Code Overlay</span>
                <button
                  onClick={() => onChange(prev => ({ ...prev, qrcode: { ...prev.qrcode, visible: !prev.qrcode.visible } }))}
                  className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold"
                >
                  {state.qrcode.visible ? 'Hide' : 'Show'}
                </button>
              </div>

              {state.qrcode.visible && (
                <div className="space-y-2 text-xs">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="QR Link / Text"
                      value={qrText}
                      onChange={(e) => setQrText(e.target.value)}
                      className="flex-1 border border-slate-200 rounded-lg px-2 py-1"
                    />
                    <button
                      onClick={generateQRCode}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold"
                    >
                      Gen
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">X Position (%)</label>
                      <input
                        type="number"
                        value={state.qrcode.x}
                        onChange={(e) => onChange(prev => ({ ...prev, qrcode: { ...prev.qrcode, x: parseInt(e.target.value) } }))}
                        className="w-full border border-slate-200 rounded p-1"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Y Position (%)</label>
                      <input
                        type="number"
                        value={state.qrcode.y}
                        onChange={(e) => onChange(prev => ({ ...prev, qrcode: { ...prev.qrcode, y: parseInt(e.target.value) } }))}
                        className="w-full border border-slate-200 rounded p-1"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Size (px)</label>
                      <input
                        type="number"
                        value={state.qrcode.size}
                        onChange={(e) => onChange(prev => ({ ...prev, qrcode: { ...prev.qrcode, size: parseInt(e.target.value) } }))}
                        className="w-full border border-slate-200 rounded p-1"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Rotate (°)</label>
                      <input
                        type="number"
                        value={state.qrcode.rotation}
                        onChange={(e) => onChange(prev => ({ ...prev, qrcode: { ...prev.qrcode, rotation: parseInt(e.target.value) } }))}
                        className="w-full border border-slate-200 rounded p-1"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Watermark Section */}
            <div className="p-3 border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-700 uppercase tracking-wider">Watermark Overlay</span>
                <button
                  onClick={() => onChange(prev => ({ ...prev, watermark: { ...prev.watermark, visible: !prev.watermark.visible } }))}
                  className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold"
                >
                  {state.watermark.visible ? 'Hide' : 'Show'}
                </button>
              </div>

              {state.watermark.visible && (
                <div className="space-y-2 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-0.5">Watermark Text</label>
                    <input
                      type="text"
                      value={state.watermark.text}
                      onChange={(e) => onChange(prev => ({ ...prev, watermark: { ...prev.watermark, text: e.target.value } }))}
                      className="w-full border border-slate-200 rounded-lg px-2 py-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Opacity</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        max="1.0"
                        value={state.watermark.opacity}
                        onChange={(e) => onChange(prev => ({ ...prev, watermark: { ...prev.watermark, opacity: parseFloat(e.target.value) } }))}
                        className="w-full border border-slate-200 rounded p-1"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Size (px)</label>
                      <input
                        type="number"
                        value={state.watermark.size}
                        onChange={(e) => onChange(prev => ({ ...prev, watermark: { ...prev.watermark, size: parseInt(e.target.value) } }))}
                        className="w-full border border-slate-200 rounded p-1"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">X (%)</label>
                      <input
                        type="number"
                        value={state.watermark.x}
                        onChange={(e) => onChange(prev => ({ ...prev, watermark: { ...prev.watermark, x: parseInt(e.target.value) } }))}
                        className="w-full border border-slate-200 rounded p-1"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Y (%)</label>
                      <input
                        type="number"
                        value={state.watermark.y}
                        onChange={(e) => onChange(prev => ({ ...prev, watermark: { ...prev.watermark, y: parseInt(e.target.value) } }))}
                        className="w-full border border-slate-200 rounded p-1"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer Export Controls */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => onExport('png')}
            className="py-2 px-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all shadow-sm flex items-center justify-center gap-1"
          >
            PNG
          </button>
          <button
            onClick={() => onExport('jpg')}
            className="py-2 px-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-sm flex items-center justify-center gap-1"
          >
            JPG
          </button>
          <button
            onClick={() => onExport('pdf')}
            className="py-2 px-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-all shadow-sm flex items-center justify-center gap-1"
          >
            PDF (Print)
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            onClick={onSaveProject}
            className="py-1.5 border border-slate-200 hover:bg-slate-100 font-semibold text-slate-600 rounded-lg transition-all"
          >
            Save Project
          </button>
          <label className="py-1.5 border border-slate-200 hover:bg-slate-100 font-semibold text-slate-600 rounded-lg transition-all text-center cursor-pointer">
            Open Project
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={onLoadProject}
            />
          </label>
        </div>
      </div>
    </div>
  );
};
