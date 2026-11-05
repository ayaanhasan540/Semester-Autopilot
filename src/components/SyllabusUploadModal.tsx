import React, { useState } from 'react';
import {
  Upload,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowRight,
  BookOpen,
  Calendar,
  Layers,
} from 'lucide-react';
import { Course, Milestone, MilestoneType } from '../types';
import { SAMPLE_SYLLABI, SampleSyllabus } from '../data/mockSyllabi';
import { parseSyllabusClientFallback } from '../utils/fallbackParser';

interface SyllabusUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCourseParsed: (course: Course, milestones: Milestone[]) => void;
}

export const SyllabusUploadModal: React.FC<SyllabusUploadModalProps> = ({
  isOpen,
  onClose,
  onCourseParsed,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste' | 'samples'>('samples');
  const [pastedText, setPastedText] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string | null>(null);

  // Parsing status
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [parseError, setParseError] = useState<string | null>(null);

  // Parsed result preview before saving
  const [parsedCourse, setParsedCourse] = useState<Course | null>(null);
  const [parsedMilestones, setParsedMilestones] = useState<Milestone[]>([]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);

      const reader = new FileReader();
      reader.onload = () => {
        setFileBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);

      const reader = new FileReader();
      reader.onload = () => {
        setFileBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleParse = async (textToParse?: string) => {
    setIsParsing(true);
    setParseError(null);

    const payloadText = textToParse || pastedText;

    try {
      let body: any = {};
      if (fileBase64 && selectedFile) {
        body = {
          fileData: {
            base64: fileBase64,
            mimeType: selectedFile.type || 'text/plain',
          },
          filename: selectedFile.name,
          text: payloadText,
        };
      } else {
        if (!payloadText.trim()) {
          setParseError('Please paste syllabus text or upload a document.');
          setIsParsing(false);
          return;
        }
        body = { text: payloadText };
      }

      const res = await fetch('/api/parse-syllabus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to parse syllabus.');
      }

      const data = json.data;
      const courseId = `c-${Date.now()}`;

      const course: Course = {
        id: courseId,
        code: data.courseCode || 'NEW COURSE',
        name: data.courseName || 'Parsed Course',
        instructor: data.instructor || 'Instructor',
        color: 'emerald',
        gradingScale: data.gradingScale || [],
      };

      const milestones: Milestone[] = (data.milestones || []).map(
        (m: any, idx: number) => ({
          id: `m-${courseId}-${idx + 1}`,
          courseId,
          title: m.title || `Deliverable ${idx + 1}`,
          type: (m.type as MilestoneType) || 'assignment',
          dueDate: m.dueDate ? (m.dueDate.includes('T') ? m.dueDate : `${m.dueDate}T23:59`) : '2026-11-20T23:59',
          weightPercent: Number(m.weightPercent) || 5,
          estimatedPrepHours: Number(m.estimatedPrepHours) || 6,
          completedHours: 0,
          difficulty: m.difficulty || 'medium',
          description: m.description || '',
          status: 'upcoming',
          prepMilestones: (m.prepMilestones || []).map((pm: any, pIdx: number) => ({
            id: `p-${courseId}-${idx + 1}-${pIdx + 1}`,
            title: pm.title || 'Study and review',
            recommendedHours: Number(pm.recommendedHours) || 2,
            daysBeforeDue: Number(pm.daysBeforeDue) || 3,
            tips: pm.tips || '',
          })),
        })
      );

      setParsedCourse(course);
      setParsedMilestones(milestones);
    } catch (err: any) {
      console.warn('API parse failed or returned 404, using client-side fallback:', err);
      // Gracefully fall back to client-side heuristic parser
      try {
        const { course, milestones } = parseSyllabusClientFallback(payloadText || selectedFile?.name || 'Uploaded Syllabus');
        setParsedCourse(course);
        setParsedMilestones(milestones);
      } catch (clientErr: any) {
        setParseError('Unable to parse syllabus text. Please try pasting the syllabus schedule.');
      }
    } finally {
      setIsParsing(false);
    }
  };

  const handleSelectSample = (sample: SampleSyllabus) => {
    const courseId = `c-${sample.id}-${Date.now()}`;
    const course: Course = {
      id: courseId,
      code: sample.courseCode,
      name: sample.courseName,
      instructor: sample.instructor,
      color: sample.color,
    };

    const milestones: Milestone[] = sample.defaultMilestones.map((m, idx) => ({
      ...m,
      id: `m-${courseId}-${idx + 1}`,
      courseId,
    }));

    setParsedCourse(course);
    setParsedMilestones(milestones);
  };

  const handleConfirmAndAdd = () => {
    if (parsedCourse && parsedMilestones.length > 0) {
      onCourseParsed(parsedCourse, parsedMilestones);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-800 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-stone-900">
                Upload & AI Parse Syllabus
              </h2>
              <p className="text-xs text-stone-500">
                Pulls out exams, assignments, projects, due dates & grade weights automatically.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* If result is parsed, show Review Screen */}
        {parsedCourse ? (
          <div className="space-y-4">
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 flex items-center justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-stone-900 uppercase">
                  {parsedCourse.code}
                </span>
                <h3 className="text-base font-semibold text-stone-900">
                  {parsedCourse.name}
                </h3>
                <span className="text-xs text-stone-500">{parsedCourse.instructor}</span>
              </div>
              <div className="text-right text-xs">
                <span className="text-stone-500 block">Extracted Deliverables</span>
                <span className="text-sm font-bold text-stone-900">
                  {parsedMilestones.length} items (
                  {parsedMilestones.reduce((acc, m) => acc + m.weightPercent, 0)}% of grade)
                </span>
              </div>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              <span className="text-xs font-semibold text-stone-700 uppercase tracking-wider block">
                Extracted Milestones & Prep Breakdown
              </span>
              {parsedMilestones.map((m) => (
                <div
                  key={m.id}
                  className="p-3 bg-white border border-stone-200 rounded-lg text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-stone-900">{m.title}</span>
                    <span className="font-bold text-amber-800">
                      {m.weightPercent}% grade
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-stone-500 text-[11px]">
                    <span className="capitalize">{m.type}</span>
                    <span aria-hidden="true">·</span>
                    <span>Due {m.dueDate.split('T')[0]}</span>
                    <span aria-hidden="true">·</span>
                    <span>Est. Prep: {m.estimatedPrepHours}h</span>
                  </div>
                  {m.prepMilestones && m.prepMilestones.length > 0 && (
                    <div className="mt-1 pl-2 border-l-2 border-stone-200 text-[11px] text-stone-600 space-y-0.5">
                      {m.prepMilestones.map((pm, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span>• {pm.title}</span>
                          <span className="font-mono text-stone-400">
                            {pm.recommendedHours}h
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-stone-100">
              <button
                onClick={() => {
                  setParsedCourse(null);
                  setParsedMilestones([]);
                }}
                className="px-3.5 py-1.5 text-xs text-stone-600 hover:text-stone-900"
              >
                Back / Parse Another
              </button>
              <button
                onClick={handleConfirmAndAdd}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-stone-900 text-white hover:bg-stone-800 shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Confirm & Add to Semester</span>
              </button>
            </div>
          </div>
        ) : (
          /* Input Tabs Screen */
          <div className="space-y-4">
            {/* Tab Buttons */}
            <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-lg text-xs">
              <button
                onClick={() => setActiveTab('samples')}
                className={`flex-1 py-1.5 font-medium rounded-md transition-colors ${
                  activeTab === 'samples'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Quick Presets
              </button>
              <button
                onClick={() => setActiveTab('upload')}
                className={`flex-1 py-1.5 font-medium rounded-md transition-colors ${
                  activeTab === 'upload'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Upload File (PDF/TXT)
              </button>
              <button
                onClick={() => setActiveTab('paste')}
                className={`flex-1 py-1.5 font-medium rounded-md transition-colors ${
                  activeTab === 'paste'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Paste Syllabus Text
              </button>
            </div>

            {/* Error Message */}
            {parseError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{parseError}</span>
              </div>
            )}

            {/* Tab 1: Quick Presets */}
            {activeTab === 'samples' && (
              <div className="space-y-3">
                <p className="text-xs text-stone-600">
                  Select a real university course syllabus to immediately inspect extracted deadlines, weights, and study plans:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SAMPLE_SYLLABI.map((sample) => (
                    <div
                      key={sample.id}
                      className="border border-stone-200 hover:border-amber-400 p-3.5 rounded-xl text-left bg-stone-50/40 hover:bg-amber-50/20 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-stone-900">
                            {sample.courseCode}
                          </span>
                          <span className="text-[11px] text-stone-500">
                            {sample.defaultMilestones.length} milestones
                          </span>
                        </div>
                        <h4 className="text-xs font-semibold text-stone-900 mt-1">
                          {sample.courseName}
                        </h4>
                        <span className="text-[11px] text-stone-500 block mt-0.5">
                          {sample.instructor}
                        </span>
                      </div>

                      <div className="mt-3 pt-2 border-t border-stone-200/60 flex items-center justify-between">
                        <button
                          onClick={() => handleSelectSample(sample)}
                          className="text-xs font-semibold text-stone-900 hover:text-amber-800 flex items-center gap-1"
                        >
                          <span>Load Preset</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setPastedText(sample.text);
                            setActiveTab('paste');
                          }}
                          className="text-[11px] text-stone-400 hover:text-stone-700"
                        >
                          View Syllabus Text
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 2: Upload File Dropzone */}
            {activeTab === 'upload' && (
              <div className="space-y-3">
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className="border-2 border-dashed border-stone-200 hover:border-amber-400 rounded-xl p-8 text-center bg-stone-50/50 hover:bg-stone-50 transition-colors cursor-pointer"
                >
                  <input
                    type="file"
                    id="syllabus-file"
                    onChange={handleFileChange}
                    accept=".pdf,.txt,.docx,.doc,.md"
                    className="hidden"
                  />
                  <label htmlFor="syllabus-file" className="cursor-pointer space-y-2 block">
                    <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-500">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-stone-900 block">
                        {selectedFile ? selectedFile.name : 'Click to upload syllabus or drag & drop'}
                      </span>
                      <span className="text-[11px] text-stone-500">
                        Supports PDF, TXT, DOCX, Markdown documents
                      </span>
                    </div>
                  </label>
                </div>

                {selectedFile && (
                  <div className="flex items-center justify-between p-2.5 bg-stone-100 rounded-lg text-xs">
                    <span className="text-stone-700 font-medium truncate">
                      {selectedFile.name} ({(selectedFile.size / 1024).toFixed(0)} KB)
                    </span>
                    <button
                      onClick={() => handleParse()}
                      disabled={isParsing}
                      className="px-3 py-1 bg-stone-900 text-white rounded-md font-medium hover:bg-stone-800 disabled:opacity-50"
                    >
                      {isParsing ? 'Analyzing...' : 'Parse File'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Paste Text */}
            {activeTab === 'paste' && (
              <div className="space-y-3">
                <textarea
                  rows={8}
                  placeholder="Paste syllabus text here (course policies, exam schedule, grade breakdown, homework dates)..."
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  className="w-full text-xs font-mono bg-white border border-stone-200 rounded-xl p-3 text-stone-800 leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />

                <div className="flex justify-end">
                  <button
                    onClick={() => handleParse()}
                    disabled={isParsing || !pastedText.trim()}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-stone-900 text-white hover:bg-stone-800 disabled:opacity-50 shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isParsing ? 'AI Parsing Syllabus...' : 'Parse with Gemini'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Loading Indicator */}
            {isParsing && (
              <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-4 text-xs text-amber-900 space-y-2">
                <div className="flex items-center gap-2 font-semibold">
                  <Sparkles className="w-4 h-4 animate-spin text-amber-700" />
                  <span>Gemini is analyzing syllabus structure...</span>
                </div>
                <p className="text-[11px] text-amber-800">
                  Identifying exam dates, calculating grade percentages, and creating paced preparation milestones.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
