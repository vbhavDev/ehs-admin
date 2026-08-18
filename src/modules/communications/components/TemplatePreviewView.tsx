'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/button/Button';
import Badge from '@/components/ui/badge/Badge';
import { CommunicationChannel, SendTemplateMessageDto } from '../types/communication.types';
import { useMessageTemplate, useMessageTemplates } from '../hooks/useMessageTemplates';
import {
  ArrowLeft,
  Mail,
  MessageSquare,
  Bell,
  FileCode,
  Send,
  Eye,
  CheckCircle2,
  AlertCircle,
  Edit,
  Sparkles,
  Zap,
  Code2,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface TemplatePreviewViewProps {
  templateId: string;
}

export const TemplatePreviewView: React.FC<TemplatePreviewViewProps> = ({ templateId }) => {
  const router = useRouter();
  const { data: template, isLoading, error } = useMessageTemplate(templateId);
  const { sendTestMessage, isSendingTest } = useMessageTemplates();

  // Field values state for used variables
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [recipient, setRecipient] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'mobile'>('desktop');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const variables = useMemo(() => template?.variables || [], [template]);

  // Helper to generate realistic sample values for variables
  const getSampleValue = (name: string) => {
    const key = name.toLowerCase();
    if (key.includes('name') || key.includes('user')) return 'John Doe';
    if (key.includes('email')) return 'john.doe@example.com';
    if (key.includes('otp') || key.includes('code')) return '489201';
    if (key.includes('url') || key.includes('link') || key.includes('href'))
      return 'https://example.com/verify-email';
    if (key.includes('phone') || key.includes('mobile')) return '+1 (555) 019-2834';
    if (key.includes('service') || key.includes('plan')) return 'Enterprise Tier';
    if (key.includes('message')) return 'Welcome to our platform! Your account is ready.';
    if (key.includes('company') || key.includes('org')) return 'EHS Clubhouse';
    if (key.includes('role')) return 'Administrator';
    if (key.includes('date') || key.includes('time')) return new Date().toLocaleDateString();
    return `[${name}]`;
  };

  // Populate initial values when template is loaded
  useEffect(() => {
    if (template) {
      const initial: Record<string, string> = {};
      variables.forEach((v) => {
        initial[v] = getSampleValue(v);
      });
      setVariableValues(initial);

      if (template.channel === CommunicationChannel.EMAIL) {
        setRecipient('test@example.com');
      } else {
        setRecipient('+15550199283');
      }
      setRecipientName('John Doe');
    }
  }, [template, variables]);

  // Rendered subject replacing {{params.v}}
  const renderedSubject = useMemo(() => {
    if (!template?.subject) return '';
    let result = template.subject;
    variables.forEach((v) => {
      const val = variableValues[v] ?? '';
      const regex = new RegExp(`{{\\s*params\\.${v}\\s*}}`, 'g');
      result = result.replace(regex, val);
    });
    return result;
  }, [template?.subject, variables, variableValues]);

  // Rendered HTML content replacing {{params.v}}
  const renderedHtml = useMemo(() => {
    if (!template?.htmlContent) return '';
    let result = template.htmlContent;
    variables.forEach((v) => {
      const val = variableValues[v] ?? '';
      const regex = new RegExp(`{{\\s*params\\.${v}\\s*}}`, 'g');
      result = result.replace(regex, val);
    });
    return result;
  }, [template?.htmlContent, variables, variableValues]);

  // Rendered Text content replacing {{params.v}}
  const renderedText = useMemo(() => {
    if (!template?.textContent) return '';
    let result = template.textContent;
    variables.forEach((v) => {
      const val = variableValues[v] ?? '';
      const regex = new RegExp(`{{\\s*params\\.${v}\\s*}}`, 'g');
      result = result.replace(regex, val);
    });
    return result;
  }, [template?.textContent, variables, variableValues]);

  // Update iframe with rendered HTML content dynamically
  useEffect(() => {
    if (template?.channel === CommunicationChannel.EMAIL && iframeRef.current) {
      const iframeDoc =
        iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(
          renderedHtml ||
            '<p style="font-family:sans-serif;color:#94a3b8;text-align:center;margin-top:100px;">No HTML content specified.</p>',
        );
        iframeDoc.close();
      }
    }
  }, [template?.channel, renderedHtml]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!recipient.trim()) {
      errs.recipient = 'Recipient contact is required to send test email.';
    } else if (template?.channel === CommunicationChannel.EMAIL) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(recipient.trim())) {
        errs.recipient = 'Please enter a valid email address.';
      }
    }

    // Validate variables
    variables.forEach((v) => {
      if (!variableValues[v] || !variableValues[v].trim()) {
        errs[`var_${v}`] = `Variable "${v}" value is required.`;
      }
    });

    setValidationErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !template) return;

    // Convert variableValues to params payload
    const paramsObj: Record<string, unknown> = {};
    variables.forEach((v) => {
      paramsObj[v] = variableValues[v] || '';
    });

    const dto: SendTemplateMessageDto = {
      slug: template.slug,
      recipient: recipient.trim(),
      recipientName: recipientName.trim() || undefined,
      params: paramsObj,
    };

    try {
      await sendTestMessage(dto);
      toast.success(
        `Test ${template.channel.toUpperCase()} message successfully sent to ${dto.recipient}`,
      );
    } catch {
      // Toast handles error message
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] space-y-3">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500"></div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Loading template details and variables...
        </p>
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="p-8 text-center space-y-4 bg-white dark:bg-navy-900 rounded-3xl border border-gray-100 dark:border-navy-800 shadow-sm max-w-lg mx-auto my-12">
        <div className="w-12 h-12 rounded-full bg-error-50 dark:bg-error-500/10 text-error-500 flex items-center justify-center mx-auto">
          <AlertCircle size={24} />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Template Not Found</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          The requested template could not be loaded or may have been deleted.
        </p>
        <Button variant="outline" onClick={() => router.push('/communications/templates')}>
          Back to Templates
        </Button>
      </div>
    );
  }

  const CHANNEL_CONFIG: Record<
    CommunicationChannel,
    { icon: React.ReactNode; label: string; color: string }
  > = {
    [CommunicationChannel.EMAIL]: {
      icon: <Mail size={14} />,
      label: 'Email Template',
      color: 'info',
    },
    [CommunicationChannel.SMS]: {
      icon: <MessageSquare size={14} />,
      label: 'SMS Template',
      color: 'success',
    },
    [CommunicationChannel.PUSH]: {
      icon: <Bell size={14} />,
      label: 'Push Notification',
      color: 'warning',
    },
    [CommunicationChannel.WEBHOOK]: {
      icon: <FileCode size={14} />,
      label: 'Webhook Payload',
      color: 'warning',
    },
  };

  const channelConfig = CHANNEL_CONFIG[template.channel];

  return (
    <div className="space-y-6">
      {/* Top Header Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/communications/templates')}
            className="p-2.5 hover:bg-gray-100 dark:hover:bg-navy-800 rounded-2xl transition-all text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-navy-800 bg-white dark:bg-navy-900"
            title="Back to Templates"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{template.name}</h1>
              <Badge
                color={channelConfig.color as 'info' | 'success' | 'warning'}
                className="flex items-center gap-1 font-bold text-[10px] uppercase tracking-wide px-2.5 py-0.5 rounded-lg border-none"
              >
                {channelConfig.icon}
                {channelConfig.label}
              </Badge>
              {template.isActive ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-lg">
                  <CheckCircle2 size={12} /> Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-400 bg-gray-100 dark:bg-navy-950 px-2 py-0.5 rounded-lg">
                  Inactive
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-mono">
              slug: <span className="text-brand-500 font-semibold">{template.slug}</span>
              {template.linkedEvent && (
                <span className="ml-3 font-sans text-gray-400">
                  Linked Event: <strong className="text-amber-500">{template.linkedEvent}</strong>
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/communications/templates/${template.id}/edit`)}
            startIcon={<Edit size={14} />}
          >
            Edit Template
          </Button>
        </div>
      </div>

      {/* Main Grid: Left preview panel & Right interactive test sending form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Template Live Preview & Subject */}
        <div className="lg:col-span-7 space-y-5">
          {/* Header Card with Subject line */}
          <div className="bg-white dark:bg-navy-900 rounded-3xl border border-gray-100 dark:border-navy-800 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-navy-800 pb-3">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
                <Eye size={14} className="text-brand-500" /> Dynamic Preview
              </span>

              {template.channel === CommunicationChannel.EMAIL && (
                <div className="flex items-center gap-1 bg-gray-100 dark:bg-navy-950 p-1 rounded-xl text-xs">
                  <button
                    type="button"
                    onClick={() => setDeviceMode('desktop')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      deviceMode === 'desktop'
                        ? 'bg-white dark:bg-navy-800 text-brand-600 dark:text-brand-400 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    Desktop
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeviceMode('mobile')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      deviceMode === 'mobile'
                        ? 'bg-white dark:bg-navy-800 text-brand-600 dark:text-brand-400 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    Mobile (375px)
                  </button>
                </div>
              )}
            </div>

            {/* Email Subject preview line */}
            {template.channel === CommunicationChannel.EMAIL && (
              <div className="bg-gray-50 dark:bg-navy-950/60 p-3.5 rounded-2xl border border-gray-150 dark:border-navy-800">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                  Subject Line:
                </p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white font-sans">
                  {renderedSubject || (
                    <span className="text-gray-400 italic">No subject line specified</span>
                  )}
                </p>
              </div>
            )}

            {/* Main Preview Box */}
            {template.channel === CommunicationChannel.EMAIL ? (
              <div className="flex justify-center transition-all py-2">
                <div
                  className={`bg-white rounded-2xl border border-gray-200 dark:border-navy-800 shadow-sm overflow-hidden transition-all duration-300 ${
                    deviceMode === 'mobile' ? 'w-[375px] h-[550px]' : 'w-full h-[550px]'
                  }`}
                >
                  <iframe
                    ref={iframeRef}
                    title="Live Template Preview"
                    className="w-full h-full border-none bg-white"
                  />
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-navy-950 p-5 rounded-2xl border border-gray-200 dark:border-navy-800 font-mono text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed min-h-[200px]">
                {renderedText || (
                  <span className="text-gray-400 italic">No text content specified</span>
                )}
              </div>
            )}
          </div>

          {/* Plain Text Fallback View if available */}
          {template.channel === CommunicationChannel.EMAIL && template.textContent && (
            <div className="bg-white dark:bg-navy-900 rounded-3xl border border-gray-100 dark:border-navy-800 p-5 shadow-sm space-y-2">
              <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
                <Code2 size={14} className="text-indigo-500" /> Plain Text Fallback Version
              </h3>
              <div className="bg-gray-50 dark:bg-navy-950 p-4 rounded-2xl border border-gray-150 dark:border-navy-800 font-mono text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {renderedText}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (5 cols): Used Variables Inputs & Testing Send Form */}
        <div className="lg:col-span-5 space-y-5">
          <form
            onSubmit={handleSendTest}
            className="bg-white dark:bg-navy-900 rounded-3xl border border-gray-100 dark:border-navy-800 p-6 shadow-sm space-y-6"
          >
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Sparkles size={18} className="text-brand-500" /> Variable Testing Input
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Enter custom values for each detected template variable to preview real-time
                rendering and send test dispatches.
              </p>
            </div>

            {/* Variable Inputs List */}
            <div className="space-y-4 pt-2 border-t border-gray-100 dark:border-navy-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Template Variables ({variables.length})
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const reset: Record<string, string> = {};
                    variables.forEach((v) => {
                      reset[v] = getSampleValue(v);
                    });
                    setVariableValues(reset);
                    setValidationErrors({});
                  }}
                  className="text-[11px] font-bold text-brand-600 dark:text-brand-400 hover:underline cursor-pointer"
                >
                  Reset Defaults
                </button>
              </div>

              {variables.length > 0 ? (
                <div className="space-y-3.5 max-h-[320px] overflow-y-auto pr-1">
                  {variables.map((v) => {
                    const hasErr = validationErrors[`var_${v}`];
                    return (
                      <div key={v} className="space-y-1">
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 font-mono flex items-center justify-between">
                          <span>{v}</span>
                          <span className="text-[10px] text-gray-400 font-sans font-normal">
                            {'{{params.' + v + '}}'}
                          </span>
                        </label>
                        <input
                          type="text"
                          value={variableValues[v] || ''}
                          onChange={(e) => {
                            setVariableValues((prev) => ({ ...prev, [v]: e.target.value }));
                            setValidationErrors((prev) => ({ ...prev, [`var_${v}`]: '' }));
                          }}
                          placeholder={`Enter custom ${v} value...`}
                          className={`w-full px-3.5 py-2.5 rounded-2xl border text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-gray-900 dark:text-white bg-white dark:bg-navy-900 ${
                            hasErr ? 'border-error-500' : 'border-gray-200 dark:border-navy-800'
                          }`}
                        />
                        {hasErr && <p className="text-[10px] text-error-500">{hasErr}</p>}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 bg-gray-50 dark:bg-navy-950 rounded-2xl border border-gray-150 dark:border-navy-800 text-xs text-gray-500 dark:text-gray-400 italic">
                  No dynamic variables defined for this template.
                </div>
              )}
            </div>

            {/* Test Send Dispatch Section */}
            <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-navy-800">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide">
                <Zap size={14} className="text-amber-500" /> Send Test Dispatch
              </div>

              {/* Recipient Input */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Recipient {template.channel === CommunicationChannel.EMAIL ? 'Email' : 'Phone'}
                </label>
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => {
                    setRecipient(e.target.value);
                    setValidationErrors((p) => ({ ...p, recipient: '' }));
                  }}
                  placeholder={
                    template.channel === CommunicationChannel.EMAIL
                      ? 'test@example.com'
                      : '+1 (555) 019-9283'
                  }
                  className={`w-full px-4 py-3 rounded-2xl border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-gray-900 dark:text-white bg-white dark:bg-navy-900 ${
                    validationErrors.recipient
                      ? 'border-error-500'
                      : 'border-gray-200 dark:border-navy-800'
                  }`}
                />
                {validationErrors.recipient && (
                  <p className="text-[11px] text-error-500 font-semibold mt-1">
                    {validationErrors.recipient}
                  </p>
                )}
              </div>

              {/* Recipient Display Name */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Recipient Display Name{' '}
                  <span className="text-gray-400 font-normal normal-case">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-navy-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-gray-900 dark:text-white bg-white dark:bg-navy-900"
                />
              </div>

              {/* Submit Button */}
              <Button
                variant="primary"
                type="submit"
                isLoading={isSendingTest}
                startIcon={<Send size={15} />}
                className="w-full py-3.5 shadow-lg shadow-brand-500/20 font-bold"
              >
                Send Test with Manual Variables
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
