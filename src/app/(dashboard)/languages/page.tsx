'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import Button from '@/components/ui/button/Button';
import { Plus, Globe, Sparkles } from 'lucide-react';
import { LanguageTable } from '@/modules/languages/components/LanguageTable';
import { LanguageFormModal } from '@/modules/languages/components/LanguageFormModal';
import { useLanguages } from '@/modules/languages/hooks/useLanguages';
import { CreateLanguageDto } from '@/modules/languages/types/languages.types';

export default function LanguagesPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { createLanguage } = useLanguages();

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageBreadcrumb pageTitle="Languages & Localization" />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Globe className="text-brand-500" size={24} />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Languages & Localization
            </h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage UI languages, active status, and upload/download translation JSON catalogs
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/languages/translate"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-purple-600 to-brand-600 hover:from-purple-700 hover:to-brand-700 text-white shadow-md hover:shadow-purple-500/20 transition-all"
          >
            <Sparkles size={16} />
            AI Translation Studio
          </Link>

          <Button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2">
            <Plus size={18} />
            Add Language
          </Button>
        </div>
      </div>

      <LanguageTable />

      {/* Add Language Modal */}
      <LanguageFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        initialData={null}
        onSubmit={async (data) => {
          await createLanguage(data as CreateLanguageDto);
        }}
      />
    </div>
  );
}
