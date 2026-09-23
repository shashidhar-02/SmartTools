import React, { useState } from 'react';
import {
  FileText,
  Upload,
  Layers,
  Scissors,
  Image as ImageIcon,
  RotateCw,
  Stamp,
  Download,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import {
  mergePDFs,
  splitPDF,
  imagesToPDF,
  rotatePDF,
  watermarkPDF,
  downloadPdfBlob,
} from '../../utils/pdfManipulation';
import { useToast } from '../Toast';

type PdfToolMode = 'merge' | 'split' | 'images' | 'rotate' | 'watermark';

interface PdfStudioProps {
  initialToolId?: string;
}

export const PdfStudio: React.FC<PdfStudioProps> = ({ initialToolId }) => {
  const { showToast } = useToast();

  const getInitialMode = (): PdfToolMode => {
    if (initialToolId === 'pdf-split') return 'split';
    if (initialToolId === 'pdf-images') return 'images';
    if (initialToolId === 'pdf-rotate') return 'rotate';
    if (initialToolId === 'pdf-watermark') return 'watermark';
    return 'merge';
  };

  const [activeMode, setActiveMode] = useState<PdfToolMode>(getInitialMode);

  React.useEffect(() => {
    if (initialToolId === 'pdf-split') setActiveMode('split');
    else if (initialToolId === 'pdf-images') setActiveMode('images');
    else if (initialToolId === 'pdf-rotate') setActiveMode('rotate');
    else if (initialToolId === 'pdf-watermark') setActiveMode('watermark');
    else if (initialToolId === 'pdf-merge') setActiveMode('merge');
  }, [initialToolId]);

  const [isProcessing, setIsProcessing] = useState(false);

  // Merge state
  const [mergeFiles, setMergeFiles] = useState<File[]>([]);

  // Split state
  const [splitFile, setSplitFile] = useState<File | null>(null);
  const [splitRanges, setSplitRanges] = useState('1-3');

  // Images to PDF state
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  // Rotate state
  const [rotateFile, setRotateFile] = useState<File | null>(null);
  const [rotationDegrees, setRotationDegrees] = useState<90 | 180 | 270>(90);

  // Watermark state
  const [watermarkFile, setWatermarkFile] = useState<File | null>(null);
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.25);

  // 1. MERGE HANDLER
  const handleMergeAction = async () => {
    if (mergeFiles.length < 2) {
      showToast('Please select at least 2 PDF files to merge.', 'error');
      return;
    }
    setIsProcessing(true);
    try {
      const mergedBytes = await mergePDFs(mergeFiles);
      downloadPdfBlob(mergedBytes, `SmartTools_Merged_${Date.now()}.pdf`);
      showToast('PDFs merged and downloaded successfully!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to merge PDFs. Ensure files are valid and uncorrupted.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // 2. SPLIT HANDLER
  const handleSplitAction = async () => {
    if (!splitFile) {
      showToast('Please select a PDF file to split.', 'error');
      return;
    }
    setIsProcessing(true);
    try {
      const splitBytes = await splitPDF(splitFile, splitRanges);
      downloadPdfBlob(splitBytes, `SmartTools_Split_${Date.now()}.pdf`);
      showToast('Pages extracted and downloaded successfully!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to extract pages. Verify page ranges.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // 3. IMAGES TO PDF HANDLER
  const handleImagesToPdfAction = async () => {
    if (imageFiles.length === 0) {
      showToast('Please select at least one JPG or PNG image.', 'error');
      return;
    }
    setIsProcessing(true);
    try {
      const pdfBytes = await imagesToPDF(imageFiles);
      downloadPdfBlob(pdfBytes, `SmartTools_Images_${Date.now()}.pdf`);
      showToast('Images converted to PDF successfully!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to convert images to PDF.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // 4. ROTATE HANDLER
  const handleRotateAction = async () => {
    if (!rotateFile) {
      showToast('Please select a PDF file to rotate.', 'error');
      return;
    }
    setIsProcessing(true);
    try {
      const rotatedBytes = await rotatePDF(rotateFile, rotationDegrees);
      downloadPdfBlob(rotatedBytes, `SmartTools_Rotated_${Date.now()}.pdf`);
      showToast(`Rotated PDF by ${rotationDegrees}° successfully!`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to rotate PDF.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // 5. WATERMARK HANDLER
  const handleWatermarkAction = async () => {
    if (!watermarkFile) {
      showToast('Please select a PDF file to watermark.', 'error');
      return;
    }
    if (!watermarkText.trim()) {
      showToast('Please enter watermark text.', 'error');
      return;
    }
    setIsProcessing(true);
    try {
      const watermarkedBytes = await watermarkPDF(watermarkFile, watermarkText, watermarkOpacity);
      downloadPdfBlob(watermarkedBytes, `SmartTools_Watermarked_${Date.now()}.pdf`);
      showToast('Watermark added successfully!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to add watermark.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>100% Client-Side In-Browser Processing • Zero Server Upload</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            PDF Studio & Manipulation Suite
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Merge, split, rotate, convert images, or watermark your PDFs directly in your browser. Since processing occurs locally using WebAssembly, your documents never touch any server.
          </p>
        </div>
      </div>

      {/* Sub-navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-4">
        {[
          { id: 'merge', label: 'Merge PDFs', icon: Layers, desc: 'Combine multiple PDFs' },
          { id: 'split', label: 'Split & Extract', icon: Scissors, desc: 'Extract specific pages' },
          { id: 'images', label: 'JPG / PNG to PDF', icon: ImageIcon, desc: 'Convert photos to document' },
          { id: 'rotate', label: 'Rotate Pages', icon: RotateCw, desc: 'Fix page orientation' },
          { id: 'watermark', label: 'Add Watermark', icon: Stamp, desc: 'Stamp confidential or custom text' },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeMode === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveMode(tab.id as PdfToolMode)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 scale-[1.02]'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Workspace Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Tool Form */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
          {/* 1. MERGE MODE */}
          {activeMode === 'merge' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Merge Multiple PDFs</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select two or more PDF files to combine into a single file in order.
                </p>
              </div>

              {/* Upload Dropzone */}
              <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer hover:bg-blue-50/40 hover:border-blue-400 transition-colors">
                <Upload className="w-10 h-10 text-blue-600 mb-2" />
                <span className="text-sm font-bold text-slate-800">
                  Click or drag PDF files here
                </span>
                <span className="text-xs text-slate-400 mt-1">
                  Supports multiple PDF selection (Hold Ctrl / ⌘ to select multiple)
                </span>
                <input
                  type="file"
                  multiple
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) {
                      setMergeFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
                    }
                  }}
                />
              </label>

              {/* File List */}
              {mergeFiles.length > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                    <span>Selected Files ({mergeFiles.length})</span>
                    <button
                      onClick={() => setMergeFiles([])}
                      className="text-rose-600 hover:underline"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                    {mergeFiles.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-slate-50/50 text-xs">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <span className="w-6 h-6 rounded bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-[10px] shrink-0">
                            {idx + 1}
                          </span>
                          <span className="font-semibold text-slate-800 truncate max-w-xs sm:max-w-md">
                            {file.name}
                          </span>
                          <span className="text-slate-400 text-[10px] shrink-0">
                            ({(file.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                        <button
                          onClick={() => setMergeFiles(mergeFiles.filter((_, i) => i !== idx))}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                disabled={mergeFiles.length < 2 || isProcessing}
                onClick={handleMergeAction}
                className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>{isProcessing ? 'Merging in Browser...' : 'Merge & Download PDF'}</span>
              </button>
            </div>
          )}

          {/* 2. SPLIT MODE */}
          {activeMode === 'split' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Split & Extract Pages</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select a PDF file and specify the pages or page ranges you wish to extract into a new document.
                </p>
              </div>

              <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer hover:bg-blue-50/40 hover:border-blue-400 transition-colors">
                <Upload className="w-10 h-10 text-indigo-600 mb-2" />
                <span className="text-sm font-bold text-slate-800">
                  {splitFile ? splitFile.name : 'Choose PDF file to split'}
                </span>
                <span className="text-xs text-slate-400 mt-1">
                  {splitFile ? `${(splitFile.size / 1024).toFixed(1)} KB selected` : 'Select a single PDF'}
                </span>
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setSplitFile(e.target.files[0]);
                    }
                  }}
                />
              </label>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Page Ranges to Extract
                </label>
                <input
                  type="text"
                  value={splitRanges}
                  onChange={(e) => setSplitRanges(e.target.value)}
                  placeholder="e.g. 1-3, 5, 8-10"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Use hyphens for ranges and commas for individual pages (e.g. &quot;1-4, 7, 10-12&quot;).
                </p>
              </div>

              <button
                disabled={!splitFile || isProcessing}
                onClick={handleSplitAction}
                className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
              >
                <Scissors className="w-4 h-4" />
                <span>{isProcessing ? 'Extracting Pages...' : 'Extract Pages & Download'}</span>
              </button>
            </div>
          )}

          {/* 3. IMAGES TO PDF */}
          {activeMode === 'images' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Images (JPG / PNG) to PDF</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Convert scanned receipts, document photos, or artwork into a crisp PDF file.
                </p>
              </div>

              <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer hover:bg-blue-50/40 hover:border-blue-400 transition-colors">
                <ImageIcon className="w-10 h-10 text-emerald-600 mb-2" />
                <span className="text-sm font-bold text-slate-800">
                  Click to select JPG / PNG images
                </span>
                <span className="text-xs text-slate-400 mt-1">
                  Supports multiple images in custom order
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) {
                      setImageFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
                    }
                  }}
                />
              </label>

              {imageFiles.length > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                    <span>{imageFiles.length} Images Selected</span>
                    <button
                      onClick={() => setImageFiles([])}
                      className="text-rose-600 hover:underline"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {imageFiles.map((file, idx) => (
                      <div key={idx} className="relative border border-slate-200 rounded-xl p-2 bg-slate-50 text-center">
                        <div className="text-[10px] font-bold text-slate-700 truncate">
                          Page {idx + 1}: {file.name}
                        </div>
                        <button
                          onClick={() => setImageFiles(imageFiles.filter((_, i) => i !== idx))}
                          className="mt-1 text-[10px] text-rose-600 hover:underline font-semibold"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                disabled={imageFiles.length === 0 || isProcessing}
                onClick={handleImagesToPdfAction}
                className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>{isProcessing ? 'Converting Images...' : 'Convert to PDF & Download'}</span>
              </button>
            </div>
          )}

          {/* 4. ROTATE MODE */}
          {activeMode === 'rotate' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Rotate PDF Pages</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Fix upside-down or sideways scanned documents.
                </p>
              </div>

              <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer hover:bg-blue-50/40 hover:border-blue-400 transition-colors">
                <RotateCw className="w-10 h-10 text-purple-600 mb-2" />
                <span className="text-sm font-bold text-slate-800">
                  {rotateFile ? rotateFile.name : 'Select PDF file to rotate'}
                </span>
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setRotateFile(e.target.files[0]);
                    }
                  }}
                />
              </label>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-2">
                  Select Rotation Angle Clockwise
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[90, 180, 270].map((deg) => (
                    <button
                      key={deg}
                      type="button"
                      onClick={() => setRotationDegrees(deg as any)}
                      className={`py-3 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 ${
                        rotationDegrees === deg
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>{deg}° Clockwise</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                disabled={!rotateFile || isProcessing}
                onClick={handleRotateAction}
                className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>{isProcessing ? 'Rotating Pages...' : 'Apply Rotation & Download'}</span>
              </button>
            </div>
          )}

          {/* 5. WATERMARK MODE */}
          {activeMode === 'watermark' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Add Watermark to PDF</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Overlay a semi-transparent security stamp or name across all pages.
                </p>
              </div>

              <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer hover:bg-blue-50/40 hover:border-blue-400 transition-colors">
                <Stamp className="w-10 h-10 text-amber-600 mb-2" />
                <span className="text-sm font-bold text-slate-800">
                  {watermarkFile ? watermarkFile.name : 'Select PDF file to watermark'}
                </span>
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setWatermarkFile(e.target.files[0]);
                    }
                  }}
                />
              </label>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Watermark Stamp Text
                </label>
                <input
                  type="text"
                  value={watermarkText}
                  onChange={(e) => setWatermarkText(e.target.value)}
                  placeholder="e.g. CONFIDENTIAL, DRAFT, COPY, or Company Name"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-700">Stamp Opacity</label>
                  <span className="text-xs font-bold text-blue-600">
                    {Math.round(watermarkOpacity * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.8"
                  step="0.05"
                  value={watermarkOpacity}
                  onChange={(e) => setWatermarkOpacity(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <button
                disabled={!watermarkFile || isProcessing}
                onClick={handleWatermarkAction}
                className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
              >
                <Stamp className="w-4 h-4" />
                <span>{isProcessing ? 'Applying Watermark...' : 'Apply Watermark & Download'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Security, Privacy & Instructions */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-emerald-950 space-y-3">
            <div className="flex items-center gap-2 font-bold text-sm text-emerald-900">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>Zero-Server Privacy Guarantee</span>
            </div>
            <p className="text-xs text-emerald-800 leading-relaxed">
              Unlike cloud-hosted PDF services that upload your private tax documents, bank statements, and IDs to remote servers, SmartTools Hub processes <strong>100% of PDF manipulation inside your browser</strong> using client-side JavaScript.
            </p>
            <div className="pt-2 text-[11px] text-emerald-700 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>No logs • No storage • Immediate processing</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Looking for Calculators?
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Every calculator on SmartTools Hub also generates official, formatted PDF reports for loan meetings, tax filings, and academic submissions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
