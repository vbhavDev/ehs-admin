'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AiTranslationStudio } from '@/modules/languages/components/AiTranslationStudio';
import { Loader2 } from 'lucide-react';

function TranslatePageContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code') || undefined;

  return <AiTranslationStudio initialCode={code} />;
}

export default function TranslatePage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            Loading AI Translation Studio...
          </p>
        </div>
      }
    >
      <TranslatePageContent />
    </Suspense>
  );
}
