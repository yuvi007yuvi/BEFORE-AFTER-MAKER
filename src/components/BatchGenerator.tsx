import React, { useState } from 'react';
import Papa from 'papaparse';
import { toBlob } from 'html-to-image';
import JSZip from 'jszip';
import { Upload, FileSpreadsheet, Download, RefreshCw, CheckCircle2 } from 'lucide-react';
import type { PosterState } from './PosterCanvas';

interface BatchGeneratorProps {
  currentState: PosterState;
  onSelectGeneratedPoster: (posterData: Partial<PosterState>) => void;
}

export const BatchGenerator: React.FC<BatchGeneratorProps> = ({
  currentState,
  onSelectGeneratedPoster,
}) => {
  const [data, setData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.data && results.data.length > 0) {
            setData(results.data);
            setHeaders(Object.keys(results.data[0] as any));
          }
        },
        error: (error) => {
          console.error("CSV Parse Error:", error);
          alert("Failed to parse CSV. Please check formatting.");
        }
      });
    }
  };

  const handleGenerateBatch = async () => {
    if (data.length === 0) return;
    setIsProcessing(true);
    const zip = new JSZip();

    // Create a temporary hidden container to render posters sequentially
    const exportContainer = document.getElementById('poster-canvas-export-target');
    if (!exportContainer) {
      alert("Canvas target not found!");
      setIsProcessing(false);
      return;
    }

    // Save original styling
    const originalTransform = exportContainer.style.transform;
    exportContainer.style.transform = 'none';

    const parent = exportContainer.parentElement;
    const originalParentOverflow = parent ? parent.style.overflow : '';
    if (parent) {
      parent.style.overflow = 'visible';
      parent.style.width = '800px';
      parent.style.height = '1000px';
    }

    setProgress({ current: 0, total: data.length });

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      
      // Temporarily set canvas inputs matching current row details
      // Trigger callback to set parent state synchronously for html-to-image to capture
      onSelectGeneratedPoster({
        mainTitle: row.Title ? { ...currentState.mainTitle, text: row.Title } : currentState.mainTitle,
        subtitle: row.Subtitle ? { ...currentState.subtitle, text: row.Subtitle } : currentState.subtitle,
        location: row.Location ? { ...currentState.location, text: `${row.Ward ? 'वार्ड-' + row.Ward + ', ' : ''}${row.Location}` } : currentState.location,
        footerSlogan: row.Footer ? { ...currentState.footerSlogan, text: row.Footer } : currentState.footerSlogan,
        beforeImage: row.BeforeImage ? { ...currentState.beforeImage, src: row.BeforeImage } : currentState.beforeImage,
        afterImage: row.AfterImage ? { ...currentState.afterImage, src: row.AfterImage } : currentState.afterImage,
      });

      // Allow DOM to update and render images
      await new Promise(resolve => setTimeout(resolve, 800));

      try {
        const blob = await toBlob(exportContainer, {
          pixelRatio: 2, // Capture at high resolution (approx 2x)
          backgroundColor: '#ffffff',
        });
        
        if (blob) {
          const fileName = `Poster_${row.Ward || ''}_${row.Location || i + 1}.png`.replace(/[/\\?%*:|"<>\s]/g, '_');
          zip.file(fileName, blob);
        }
      } catch (err) {
        console.error("Error generating row poster:", err);
      }

      setProgress(prev => ({ ...prev, current: i + 1 }));
    }

    // Restore original transform
    exportContainer.style.transform = originalTransform;
    if (parent) {
      parent.style.overflow = originalParentOverflow;
      parent.style.width = '';
      parent.style.height = '';
    }

    // Generate ZIP
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(zipBlob);
    link.download = `Campaign_Posters_Batch_${Date.now()}.zip`;
    link.click();

    setIsProcessing(false);
  };

  const downloadSampleCSV = () => {
    const csvContent = "Title,Subtitle,Ward,Location,Footer,BeforeImage,AfterImage\n" +
      "नगर निगम मथुरा-वृंदावन,विशेष सफाई अभियान,66,काली मंदिर GVP पॉइंट की सफाई,\"हम सब ने ठाना है, ब्रज को स्वच्छ बनाना है\",https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=500,https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500\n" +
      "नगर निगम मथुरा-वृंदावन,विशेष सफाई अभियान,24,सदर बाजार मार्ग की धुलाई,\"स्वच्छता ही सेवा है, हमारा संकल्प\",https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=500,https://images.unsplash.com/photo-1563986768609-322da13575f3?w=500";
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = "sample_batch_campaign.csv";
    link.click();
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            Batch Poster Generator
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Generate dozens of posters instantly by uploading a spreadsheet.
          </p>
        </div>
        <button
          onClick={downloadSampleCSV}
          className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 transition-all self-start sm:self-center"
        >
          Download Template CSV
        </button>
      </div>

      {data.length === 0 ? (
        <div className="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-2xl p-8 flex flex-col items-center justify-center transition-all bg-slate-50/50">
          <Upload className="w-10 h-10 text-slate-300 mb-3 animate-bounce" />
          <p className="text-sm font-semibold text-slate-600 mb-1">Drag and drop your Campaign CSV file here</p>
          <p className="text-xs text-slate-400 mb-4">or browse files from your computer</p>
          <label className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer">
            Select CSV File
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Loaded Info */}
          <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span className="text-xs font-bold text-emerald-800">Successfully Loaded {data.length} Campaign Rows</span>
            </div>
            <button
              onClick={() => { setData([]); setHeaders([]); }}
              className="text-xs font-semibold text-red-600 hover:text-red-700"
            >
              Clear Data
            </button>
          </div>

          {/* Table Preview */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl max-h-48">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 sticky top-0 border-b border-slate-200">
                <tr>
                  {headers.map((h) => (
                    <th key={h} className="p-3 font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {data.slice(0, 5).map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    {headers.map((h) => (
                      <td key={h} className="p-3 text-slate-600 truncate max-w-[150px]">{row[h]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data.length > 5 && (
            <p className="text-[10px] text-slate-400 text-right italic">+ {data.length - 5} more rows loaded</p>
          )}

          {/* Trigger Button */}
          <div className="pt-2">
            {isProcessing ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin mx-auto mb-2" />
                <span className="text-xs font-semibold text-emerald-800 block">Generating Posters in ZIP...</span>
                <span className="text-[10px] text-emerald-500">{progress.current} of {progress.total} posters completed</span>
              </div>
            ) : (
              <button
                onClick={handleGenerateBatch}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Generate and Download Batch Posters (.ZIP)
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
