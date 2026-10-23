'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Download,
  FileText,
  FileCode,
  Presentation,
  ChevronDown,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from './Toast';

interface ExportReportDropdownProps {
  submissionId: string;
  submissionTitle?: string;
  className?: string;
}

export function ExportReportDropdown({
  submissionId,
  submissionTitle,
  className = '',
}: ExportReportDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [exportingFormat, setExportingFormat] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { success, error: toastError } = useToast();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExport = async (format: 'pdf' | 'docx' | 'pptx') => {
    try {
      setExportingFormat(format);
      const cleanPrefix = submissionTitle
        ? 'pineco-' + submissionTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30)
        : 'pineco-compliance-report';
      const downloadedName = await api.exportSubmissionReport(submissionId, format, cleanPrefix);
      success('Export Completed', `Downloaded ${downloadedName}`);
      setIsOpen(false);
    } catch (err: any) {
      toastError('Export Failed', err.message || `Failed to export ${format.toUpperCase()}`);
    } finally {
      setExportingFormat(null);
    }
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={!!exportingFormat}
        className="flex items-center space-x-1.5 bg-white hover:bg-neutral-50 text-black border border-neutral-300 hover:border-purple-600 text-xs font-semibold px-3.5 py-2 rounded-xl shadow-xs transition active:scale-95 disabled:opacity-50"
      >
        {exportingFormat ? (
          <RefreshCw className="w-3.5 h-3.5 text-purple-600 animate-spin" />
        ) : (
          <Download className="w-3.5 h-3.5 text-purple-600" />
        )}
        <span>{exportingFormat ? `Exporting ${exportingFormat.toUpperCase()}...` : 'Export Report'}</span>
        <ChevronDown className="w-3 h-3 text-neutral-400 ml-0.5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white border border-neutral-200 shadow-xl z-50 p-2 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-2 border-b border-neutral-100 mb-1">
            <span className="text-[11px] font-bold text-black uppercase tracking-wider block">
              Export Compliance Audit
            </span>
            <span className="text-[10px] text-neutral-500">
              Download formal verification results in your preferred format
            </span>
          </div>

          <div className="space-y-1">
            {/* PDF Option */}
            <button
              type="button"
              onClick={() => handleExport('pdf')}
              disabled={!!exportingFormat}
              className="w-full flex items-start space-x-3 p-2.5 rounded-xl hover:bg-purple-50/60 text-left transition group"
            >
              <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0 mt-0.5 border border-red-200/60 group-hover:bg-red-100">
                <FileText className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-black group-hover:text-purple-700">
                    PDF Document
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-100 text-neutral-600 font-bold">
                    .pdf
                  </span>
                </div>
                <p className="text-[11px] text-neutral-500 leading-tight mt-0.5">
                  Formal audit report with scorecard, citations & findings table
                </p>
              </div>
            </button>

            {/* Word DOCX Option */}
            <button
              type="button"
              onClick={() => handleExport('docx')}
              disabled={!!exportingFormat}
              className="w-full flex items-start space-x-3 p-2.5 rounded-xl hover:bg-purple-50/60 text-left transition group"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 border border-blue-200/60 group-hover:bg-blue-100">
                <FileCode className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-black group-hover:text-purple-700">
                    Word Document
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-100 text-neutral-600 font-bold">
                    .docx
                  </span>
                </div>
                <p className="text-[11px] text-neutral-500 leading-tight mt-0.5">
                  Editable corporate compliance report with styled data tables
                </p>
              </div>
            </button>

            {/* PowerPoint PPTX Option */}
            <button
              type="button"
              onClick={() => handleExport('pptx')}
              disabled={!!exportingFormat}
              className="w-full flex items-start space-x-3 p-2.5 rounded-xl hover:bg-purple-50/60 text-left transition group"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5 border border-amber-200/60 group-hover:bg-amber-100">
                <Presentation className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-black group-hover:text-purple-700">
                    PowerPoint Presentation
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-100 text-neutral-600 font-bold">
                    .pptx
                  </span>
                </div>
                <p className="text-[11px] text-neutral-500 leading-tight mt-0.5">
                  5-slide executive deck with KPI cards & remediation slides
                </p>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
