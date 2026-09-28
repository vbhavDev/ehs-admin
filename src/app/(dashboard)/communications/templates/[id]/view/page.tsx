'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { TemplatePreviewView } from '@/modules/communications/components/TemplatePreviewView';

export default function ViewTemplatePage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="animate-fade-in">
      <TemplatePreviewView templateId={id} />
    </div>
  );
}
