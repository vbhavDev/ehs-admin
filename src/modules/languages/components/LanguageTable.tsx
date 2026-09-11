'use client';
import React, { useState } from 'react';
import { DataTable, Column } from '@/components/ui/table/DataTable';
import { Language } from '../types/languages.types';
import { useLanguages } from '../hooks/useLanguages';
import { useGlobalModal } from '@/hooks/useGlobalModal';
import { UploadJsonModal } from './UploadJsonModal';
import { LanguageFormModal } from './LanguageFormModal';
import { AiTranslateModal } from './AiTranslateModal';
import Link from 'next/link';
import {
  Download,
  Upload,
  Edit,
  Trash2,
  Star,
  FileCode,
  CheckCircle2,
  XCircle,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface LanguageTableProps {
  onAddLanguageRequested?: (trigger: () => void) => void;
}

export const LanguageTable: React.FC<LanguageTableProps> = () => {
  const [params, setParams] = useState({
    page: 1,
    limit: 10,
    search: '',
  });

  const {
    languages,
    meta,
    isLoading,
    updateLanguage,
    toggleStatus,
    setDefault,
    deleteLanguage,
    downloadCatalog,
    uploadCatalogFile,
    importCatalog,
    generateAiTranslation,
  } = useLanguages(params);

  const { confirm } = useGlobalModal();

  // Modals state
  const [uploadModalLanguage, setUploadModalLanguage] = useState<Language | null>(null);
  const [editModalLanguage, setEditModalLanguage] = useState<Language | null>(null);
  const [aiTranslateLanguage, setAiTranslateLanguage] = useState<Language | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [downloadingCode, setDownloadingCode] = useState<string | null>(null);

  const handleDownload = async (language: Language) => {
    try {
      setDownloadingCode(language.code);
      await downloadCatalog(language.code);
      toast.success(`Downloaded ${language.code}.json`);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to download translation file';
      toast.error(errorMsg);
    } finally {
      setDownloadingCode(null);
    }
  };

  const handleToggleStatus = async (language: Language) => {
    if (language.isDefault && language.isActive) {
      toast.error('The default system language cannot be deactivated');
      return;
    }
    await toggleStatus({ id: language.id, isActive: !language.isActive });
  };

  const handleSetDefault = (language: Language) => {
    if (language.isDefault) return;
    confirm({
      title: 'Set Default Language',
      message: `Set "${language.name} (${language.code})" as the primary default language? It will become the fallback language for all missing translations across the platform.`,
      confirmText: 'Set as Default',
      type: 'warning',
      onConfirm: async () => {
        await setDefault(language.id);
      },
    });
  };

  const handleDelete = (language: Language) => {
    if (language.isDefault) {
      toast.error('Cannot delete the primary default language');
      return;
    }

    confirm({
      title: 'Delete Language',
      message: `Are you sure you want to delete "${language.name} (${language.code})"? All associated translation catalogs will also be permanently archived.`,
      confirmText: 'Delete Language',
      type: 'danger',
      onConfirm: async () => {
        await deleteLanguage(language.id);
      },
    });
  };

  const columns: Column<Language>[] = [
    {
      header: 'Language',
      accessor: (lang) => (
        <div className="flex items-center gap-3">
          <span className="text-2xl leading-none" role="img" aria-label={lang.name}>
            {lang.flag || '🌐'}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-900 dark:text-white text-sm">{lang.name}</span>
              <span className="inline-flex items-center rounded-md bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700 dark:bg-brand-500/15 dark:text-brand-400 uppercase">
                {lang.code}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{lang.nativeName}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Direction',
      accessor: (lang) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider ${
            lang.direction === 'rtl'
              ? 'bg-purple-50 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400 border border-purple-200/50 dark:border-purple-500/20'
              : 'bg-gray-100 text-gray-700 dark:bg-navy-700 dark:text-gray-300'
          }`}
        >
          {lang.direction || 'ltr'}
        </span>
      ),
    },
    {
      header: 'Default',
      accessor: (lang) =>
        lang.isDefault ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 dark:bg-amber-500/15 dark:text-amber-400 border border-amber-200/60 dark:border-amber-500/20">
            <Star size={13} className="fill-amber-500 text-amber-500" />
            Default
          </span>
        ) : (
          <button
            onClick={() => handleSetDefault(lang)}
            className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-amber-600 transition-colors py-1 px-2 rounded-md hover:bg-amber-50 dark:hover:bg-amber-500/10"
            title="Click to set as primary default language"
          >
            <Star size={12} />
            Make Default
          </button>
        ),
    },
    {
      header: 'Catalog & Keys',
      accessor: (lang) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <FileCode size={14} className="text-brand-500" />
            <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
              {lang.totalKeys || 0} keys
            </span>
          </div>
          <span className="text-[11px] text-gray-400">
            {lang.lastTranslatedAt
              ? `Synced ${new Date(lang.lastTranslatedAt).toLocaleDateString()}`
              : 'Initial catalog'}
          </span>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (lang) => (
        <button
          onClick={() => handleToggleStatus(lang)}
          disabled={lang.isDefault}
          className={`group relative overflow-hidden flex items-center justify-center px-3 py-1 rounded-full font-medium text-xs transition-colors duration-200 ${
            lang.isDefault
              ? 'bg-success-50 text-success-700 cursor-not-allowed opacity-90 dark:bg-success-500/15 dark:text-success-400'
              : lang.isActive
                ? 'bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-400 hover:bg-error-50 hover:text-error-600 dark:hover:bg-error-500/15 dark:hover:text-error-500'
                : 'bg-gray-100 text-gray-500 dark:bg-navy-700 dark:text-gray-400 hover:bg-success-50 hover:text-success-600'
          }`}
          title={lang.isDefault ? 'Primary language is always active' : 'Click to toggle status'}
        >
          <span className="flex items-center gap-1">
            {lang.isActive ? (
              <>
                <CheckCircle2 size={12} className="text-success-600 dark:text-success-400" />
                Active
              </>
            ) : (
              <>
                <XCircle size={12} className="text-gray-400" />
                Inactive
              </>
            )}
          </span>
        </button>
      ),
    },
    {
      header: 'Actions',
      accessor: (lang) => (
        <div className="flex items-center gap-1.5">
          {/* Download JSON */}
          <button
            onClick={() => handleDownload(lang)}
            disabled={downloadingCode === lang.code}
            className="p-1.5 text-gray-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors dark:text-gray-400 dark:hover:text-brand-400 dark:hover:bg-brand-500/10"
            title="Download JSON translation file"
          >
            <Download size={16} className={downloadingCode === lang.code ? 'animate-bounce' : ''} />
          </button>

          {/* AI Auto-Translate Studio */}
          <Link
            href={`/languages/translate?code=${lang.code}`}
            className="p-1.5 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors dark:text-purple-400 dark:hover:text-purple-300 dark:hover:bg-purple-500/15"
            title="Open in AI Translation Studio (Gemini / OpenAI)"
          >
            <Sparkles size={16} />
          </Link>

          {/* Upload JSON */}
          <button
            onClick={() => setUploadModalLanguage(lang)}
            className="p-1.5 text-gray-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors dark:text-gray-400 dark:hover:text-brand-400 dark:hover:bg-brand-500/10"
            title="Upload / Replace JSON translation file"
          >
            <Upload size={16} />
          </button>

          {/* Edit language metadata */}
          <button
            onClick={() => {
              setEditModalLanguage(lang);
              setIsEditModalOpen(true);
            }}
            className="p-1.5 text-gray-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors dark:text-gray-400 dark:hover:text-brand-400 dark:hover:bg-brand-500/10"
            title="Edit Language"
          >
            <Edit size={16} />
          </button>

          {/* Delete language */}
          <button
            onClick={() => handleDelete(lang)}
            disabled={lang.isDefault}
            className={`p-1.5 rounded-lg transition-colors ${
              lang.isDefault
                ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                : 'text-gray-500 hover:text-error-600 hover:bg-error-50 dark:text-gray-400 dark:hover:text-error-400 dark:hover:bg-error-500/10'
            }`}
            title={lang.isDefault ? 'Cannot delete default language' : 'Delete Language'}
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <DataTable
        data={languages}
        columns={columns}
        isLoading={isLoading}
        serverSide
        totalItems={meta?.total}
        page={params.page}
        limit={params.limit}
        search={params.search}
        onPageChange={(page) => setParams((p) => ({ ...p, page }))}
        onPageSizeChange={(limit) => setParams((p) => ({ ...p, limit, page: 1 }))}
        onSearchChange={(search) => setParams((p) => ({ ...p, search, page: 1 }))}
      />

      {/* Upload JSON Modal */}
      <UploadJsonModal
        isOpen={!!uploadModalLanguage}
        onClose={() => setUploadModalLanguage(null)}
        language={uploadModalLanguage}
        onUpload={uploadCatalogFile}
      />

      {/* AI Translate Modal */}
      <AiTranslateModal
        isOpen={!!aiTranslateLanguage}
        onClose={() => setAiTranslateLanguage(null)}
        language={aiTranslateLanguage}
        onGenerate={generateAiTranslation}
        onSaveCatalog={importCatalog}
      />

      {/* Edit Language Modal */}
      <LanguageFormModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditModalLanguage(null);
        }}
        initialData={editModalLanguage}
        onSubmit={async (data) => {
          if (editModalLanguage) {
            await updateLanguage({
              id: editModalLanguage.id,
              data,
            });
          }
        }}
      />
    </div>
  );
};
