'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PluginItem, UpdatePluginData } from '@/types/plugin.types';
import { pluginsService } from '@/services/plugins.service';
import { PluginConfigDrawer } from './PluginConfigDrawer';
import {
  ArrowLeft,
  Plug,
  Mail,
  Send,
  CreditCard,
  Wallet,
  DollarSign,
  Globe,
  MessageSquare,
  Smartphone,
  Database,
  Cpu,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Activity,
  Settings2,
  Key,
  ShieldCheck,
  Layers,
  FileText,
  Copy,
  Check,
  RefreshCw,
  Loader2,
  UserCheck,
  CheckSquare,
  Star,
  Webhook,
  Trash2,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface PluginDetailViewProps {
  plugin: PluginItem;
  onToggleStatus: (key: string, current: boolean) => Promise<void> | void;
  onTestConnection: (key: string) => Promise<unknown>;
  onUpdatePlugin: (key: string, data: UpdatePluginData) => Promise<PluginItem>;
  isTesting?: boolean;
}

const ICON_MAP: Record<string, React.ElementType> = {
  plug: Plug,
  mail: Mail,
  send: Send,
  'credit-card': CreditCard,
  wallet: Wallet,
  'dollar-sign': DollarSign,
  globe: Globe,
  'message-square': MessageSquare,
  smartphone: Smartphone,
  database: Database,
  cpu: Cpu,
};

export function PluginDetailView({
  plugin,
  onToggleStatus,
  onTestConnection,
  onUpdatePlugin,
  isTesting = false,
}: PluginDetailViewProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'settings' | 'logs'>('overview');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Brevo Senders state
  const [brevoSenders, setBrevoSenders] = useState<Array<{
    id: number;
    name: string;
    email: string;
    active: boolean;
  }> | null>(
    (plugin.settings?.senders as Array<{
      id: number;
      name: string;
      email: string;
      active: boolean;
    }>) || null,
  );
  const [isFetchingSenders, setIsFetchingSenders] = useState(false);
  const [selectedSenderId, setSelectedSenderId] = useState<number | null>(
    (plugin.settings?.activeSenderId as number) ||
      (plugin.settings?.defaultSenderId as number) ||
      null,
  );
  const [defaultSenderId, setDefaultSenderId] = useState<number | null>(
    (plugin.settings?.defaultSenderId as number) ||
      (plugin.settings?.activeSenderId as number) ||
      null,
  );

  // Brevo Webhook state
  const [webhookUrlInput, setWebhookUrlInput] = useState<string>(
    (plugin.settings?.brevoWebhookUrl as string) || '',
  );
  const [brevoWebhookId, setBrevoWebhookId] = useState<number | null>(
    (plugin.settings?.brevoWebhookId as number) || null,
  );
  const [isRegisteringWebhook, setIsRegisteringWebhook] = useState(false);
  const [isUnregisteringWebhook, setIsUnregisteringWebhook] = useState(false);

  const handleRegisterWebhook = async () => {
    const trimmedUrl = webhookUrlInput.trim();
    if (!trimmedUrl || !trimmedUrl.startsWith('http')) {
      toast.error('Please enter a valid HTTP/HTTPS Webhook URL');
      return;
    }
    try {
      setIsRegisteringWebhook(true);
      const res = await pluginsService.registerBrevoWebhook(plugin.pluginKey, trimmedUrl);
      setBrevoWebhookId(res.webhookId);
      setWebhookUrlInput(res.url);
      toast.success(`Registered Brevo Webhook successfully! Webhook ID: #${res.webhookId}`);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Failed to register webhook with Brevo';
      toast.error(errMsg);
    } finally {
      setIsRegisteringWebhook(false);
    }
  };

  const handleUnregisterWebhook = async () => {
    try {
      setIsUnregisteringWebhook(true);
      await pluginsService.unregisterBrevoWebhook(plugin.pluginKey);
      setBrevoWebhookId(null);
      toast.success('Brevo Webhook unregistered successfully!');
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Failed to unregister webhook';
      toast.error(errMsg);
    } finally {
      setIsUnregisteringWebhook(false);
    }
  };

  const handleFetchBrevoSenders = async () => {
    try {
      setIsFetchingSenders(true);
      const res = await pluginsService.getBrevoSenders(plugin.pluginKey);
      setBrevoSenders(res.senders);
      if (res.defaultSenderId) {
        setDefaultSenderId(res.defaultSenderId);
        setSelectedSenderId(res.defaultSenderId);
      } else if (res.activeSenderId) {
        setSelectedSenderId(res.activeSenderId);
      }
      toast.success(`Fetched ${res.senders.length} sender(s) from Brevo API!`);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Failed to fetch Brevo senders';
      toast.error(errMsg);
    } finally {
      setIsFetchingSenders(false);
    }
  };

  const handleSelectBrevoSender = async (sender: { id: number; name: string; email: string }) => {
    try {
      setSelectedSenderId(sender.id);
      await onUpdatePlugin(plugin.pluginKey, {
        credentials: {
          ...(plugin.credentials || {}),
          senderEmail: sender.email,
          senderName: sender.name,
        },
        settings: {
          ...(plugin.settings || {}),
          activeSenderId: sender.id,
          activeSenderEmail: sender.email,
          activeSenderName: sender.name,
        },
      });
      toast.success(`Selected Sender ID #${sender.id} (${sender.email})`);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Failed to set active sender';
      toast.error(errMsg);
    }
  };

  const handleSetDefaultSender = async (sender: { id: number; name: string; email: string }) => {
    try {
      setSelectedSenderId(sender.id);
      setDefaultSenderId(sender.id);
      await pluginsService.setDefaultSender(plugin.pluginKey, {
        senderId: sender.id,
        senderEmail: sender.email,
        senderName: sender.name,
      });
      await onUpdatePlugin(plugin.pluginKey, {
        credentials: {
          ...(plugin.credentials || {}),
          senderEmail: sender.email,
          senderName: sender.name,
        },
        settings: {
          ...(plugin.settings || {}),
          defaultSenderId: sender.id,
          defaultSenderEmail: sender.email,
          defaultSenderName: sender.name,
          activeSenderId: sender.id,
          activeSenderEmail: sender.email,
          activeSenderName: sender.name,
        },
      });
      toast.success(
        `Default Sender set to ID #${sender.id} (${sender.email}) for all outbound emails!`,
      );
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Failed to set default sender';
      toast.error(errMsg);
    }
  };

  const IconComponent = ICON_MAP[plugin.icon || 'plug'] || Plug;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    toast.success(`Copied ${label} to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const formatDate = (dateVal?: string | Date | null) => {
    if (!dateVal) return 'N/A';
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Mocked activity logs based on plugin health test status
  const mockLogs = [
    {
      id: 'log-1',
      timestamp: plugin.lastTestedAt || plugin.updatedAt,
      event: 'API Connection Health Test',
      type: 'HEALTH_CHECK',
      status:
        plugin.lastTestStatus === 'success'
          ? 'SUCCESS'
          : plugin.lastTestStatus === 'failed'
            ? 'FAILED'
            : 'INFO',
      message: plugin.lastTestMessage || 'Initial connection check performed.',
      responseTimeMs: plugin.lastTestStatus === 'success' ? 142 : 450,
    },
    {
      id: 'log-2',
      timestamp: plugin.updatedAt,
      event: 'Plugin Configuration Updated',
      type: 'CONFIG_CHANGE',
      status: 'SUCCESS',
      message: 'Integration settings and credentials updated by administrator.',
      responseTimeMs: 85,
    },
    {
      id: 'log-3',
      timestamp: plugin.createdAt,
      event: 'Plugin Integration Registered',
      type: 'SYSTEM',
      status: 'SUCCESS',
      message: `Plugin registered with key '${plugin.pluginKey}' for provider '${plugin.provider}'.`,
      responseTimeMs: 110,
    },
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto min-h-screen space-y-6">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push('/plugins')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to Plugins</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Link href="/plugins" className="hover:underline">
            Plugins
          </Link>
          <span>/</span>
          <span className="font-semibold text-gray-700 dark:text-gray-200">{plugin.name}</span>
        </div>
      </div>

      {/* Main Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm dark:border-navy-800 dark:bg-navy-900">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-600 text-white shadow-lg shadow-brand-500/20">
              <IconComponent size={32} />
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{plugin.name}</h1>

                {/* Status Pill */}
                {plugin.isEnabled ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-extrabold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-500/20">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    USED IN CURRENT
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-extrabold text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 border border-blue-500/20">
                    AVAILABLE FOR USE
                  </span>
                )}

                {/* Mode Pill */}
                {plugin.isTestMode ? (
                  <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    SANDBOX MODE
                  </span>
                ) : (
                  <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    PRODUCTION
                  </span>
                )}
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                Key: <span className="text-brand-600 dark:text-brand-400">{plugin.pluginKey}</span>{' '}
                | Provider: {plugin.provider}
              </p>

              <p className="text-xs text-gray-600 dark:text-gray-300 pt-1 max-w-2xl">
                {plugin.description || 'No description provided.'}
              </p>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onTestConnection(plugin.pluginKey)}
              disabled={isTesting}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 transition-all hover:bg-gray-50 dark:border-navy-700 dark:bg-navy-800 dark:text-gray-200 dark:hover:bg-navy-700 disabled:opacity-50"
            >
              {isTesting ? (
                <Loader2 size={15} className="animate-spin text-brand-500" />
              ) : (
                <Activity size={15} className="text-brand-500" />
              )}
              <span>Test API Health</span>
            </button>

            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-brand-500/20 transition-all hover:bg-brand-600 active:scale-95"
            >
              <Settings2 size={15} />
              <span>Configure Settings</span>
            </button>

            {/* Enable/Disable Toggle */}
            <button
              type="button"
              onClick={() => onToggleStatus(plugin.pluginKey, plugin.isEnabled)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all ${
                plugin.isEnabled
                  ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400'
                  : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400'
              }`}
            >
              {plugin.isEnabled ? 'Disable Plugin' : 'Enable Plugin'}
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-t border-gray-100 pt-4 mt-6 dark:border-navy-800">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === 'overview'
                ? 'bg-brand-500 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-navy-800'
            }`}
          >
            <Layers size={14} />
            <span>Overview & Health</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === 'settings'
                ? 'bg-brand-500 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-navy-800'
            }`}
          >
            <Key size={14} />
            <span>Credentials & Settings</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('logs')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === 'logs'
                ? 'bg-brand-500 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-navy-800'
            }`}
          >
            <FileText size={14} />
            <span>Health & Activity Logs</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Overview & Health */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Health Status Card */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-navy-800 dark:bg-navy-900">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Activity size={18} className="text-brand-500" />
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    API Health Connection Status
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => onTestConnection(plugin.pluginKey)}
                  disabled={isTesting}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400 disabled:opacity-50"
                >
                  <RefreshCw size={13} className={isTesting ? 'animate-spin' : ''} />
                  <span>Re-test Connection</span>
                </button>
              </div>

              <div
                className={`rounded-2xl p-5 border ${
                  plugin.lastTestStatus === 'success'
                    ? 'border-emerald-500/30 bg-emerald-50/50 dark:border-emerald-500/20 dark:bg-emerald-500/10'
                    : plugin.lastTestStatus === 'failed'
                      ? 'border-rose-500/30 bg-rose-50/50 dark:border-rose-500/20 dark:bg-rose-500/10'
                      : 'border-gray-200 bg-gray-50/50 dark:border-navy-700 dark:bg-navy-800/40'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {plugin.lastTestStatus === 'success' && (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white">
                        <CheckCircle2 size={20} />
                      </div>
                    )}
                    {plugin.lastTestStatus === 'failed' && (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500 text-white">
                        <XCircle size={20} />
                      </div>
                    )}
                    {plugin.lastTestStatus === 'untested' && (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-400 text-white">
                        <AlertCircle size={20} />
                      </div>
                    )}
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                        {plugin.lastTestStatus === 'success'
                          ? 'Connection Verified & Healthy'
                          : plugin.lastTestStatus === 'failed'
                            ? 'Connection Check Failed'
                            : 'Not Tested Yet'}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">
                        {plugin.lastTestMessage || 'No test response message available.'}
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono text-gray-500 dark:text-gray-400 shrink-0">
                    {plugin.lastTestedAt ? new Date(plugin.lastTestedAt).toLocaleString() : 'Never'}
                  </span>
                </div>
              </div>

              {/* Plugin Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100 dark:border-navy-800 text-xs">
                <div>
                  <span className="block font-medium text-gray-400">Category</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200 capitalize">
                    {plugin.category}
                  </span>
                </div>
                <div>
                  <span className="block font-medium text-gray-400">Provider</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">
                    {plugin.provider}
                  </span>
                </div>
                <div>
                  <span className="block font-medium text-gray-400">Created Date</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">
                    {formatDate(plugin.createdAt)}
                  </span>
                </div>
                <div>
                  <span className="block font-medium text-gray-400">Last Updated</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">
                    {formatDate(plugin.updatedAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Brevo Active Senders Manager Card */}
            {(plugin.provider === 'brevo' || plugin.pluginKey === 'brevo') && (
              <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-navy-800 dark:bg-navy-900 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <UserCheck size={18} className="text-brand-500" />
                      Brevo Active Verified Senders
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Emails will be dispatched using the selected Active Sender ID from your Brevo
                      account.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleFetchBrevoSenders}
                    disabled={isFetchingSenders}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-navy-700 dark:bg-navy-800 dark:text-gray-200 dark:hover:bg-navy-700 disabled:opacity-50"
                  >
                    <RefreshCw
                      size={13}
                      className={isFetchingSenders ? 'animate-spin text-brand-500' : ''}
                    />
                    <span>Fetch Active Senders</span>
                  </button>
                </div>

                {/* Senders List */}
                {!brevoSenders || brevoSenders.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-gray-200 p-6 text-center text-xs text-gray-500 dark:border-navy-700 dark:text-gray-400">
                    No senders fetched yet. Click <strong>Fetch Active Senders</strong> or test the
                    connection to query live sender IDs from Brevo.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {brevoSenders.map((s) => {
                      const isDefault = defaultSenderId === s.id;
                      const isSelected = selectedSenderId === s.id;
                      return (
                        <div
                          key={s.id}
                          onClick={() => handleSelectBrevoSender(s)}
                          className={`relative cursor-pointer rounded-2xl p-4 border transition-all flex flex-col justify-between gap-3 ${
                            isDefault
                              ? 'border-amber-500 bg-amber-50/40 dark:border-amber-500/80 dark:bg-amber-500/10 shadow-md ring-1 ring-amber-500/30'
                              : isSelected
                                ? 'border-brand-500 bg-brand-50/40 dark:border-brand-500 dark:bg-brand-500/10 shadow-sm'
                                : 'border-gray-100 bg-gray-50/50 hover:border-gray-200 dark:border-navy-800 dark:bg-navy-800/40 dark:hover:border-navy-700'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-1 text-xs">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-gray-900 dark:text-white">
                                  {s.name}
                                </span>
                                <span className="rounded bg-gray-200 px-1.5 py-0.5 text-[10px] font-mono text-gray-600 dark:bg-navy-700 dark:text-gray-300">
                                  ID #{s.id}
                                </span>
                              </div>
                              <p className="font-mono text-[11px] text-gray-600 dark:text-gray-300">
                                {s.email}
                              </p>
                              <div className="flex items-center gap-2 pt-1">
                                <span
                                  className={`inline-flex items-center gap-1 text-[10px] font-bold ${
                                    s.active
                                      ? 'text-emerald-600 dark:text-emerald-400'
                                      : 'text-amber-600'
                                  }`}
                                >
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                  {s.active ? 'Verified & Active' : 'Pending Verification'}
                                </span>
                              </div>
                            </div>

                            {/* Badges / Status */}
                            <div className="shrink-0 flex flex-col items-end gap-1">
                              {isDefault ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-extrabold text-white shadow-xs">
                                  <Star size={11} className="fill-white" />
                                  DEFAULT SENDER
                                </span>
                              ) : isSelected ? (
                                <CheckSquare size={18} className="text-brand-500" />
                              ) : null}
                            </div>
                          </div>

                          {/* Footer Action */}
                          <div className="pt-2.5 border-t border-gray-200/60 dark:border-navy-700/60 flex items-center justify-between">
                            <span className="text-[11px] text-gray-500 dark:text-gray-400">
                              {isDefault
                                ? 'Default for all outbound emails'
                                : 'Available verified identity'}
                            </span>
                            {!isDefault && (
                              <button
                                type="button"
                                onClick={() => handleSetDefaultSender(s)}
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 underline"
                              >
                                <Star size={11} />
                                Set as Default
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Brevo Webhook Configuration & Event Tracker Card */}
            {(plugin.provider === 'brevo' || plugin.pluginKey === 'brevo') && (
              <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-navy-800 dark:bg-navy-900 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <Webhook size={18} className="text-brand-500" />
                      Brevo Webhook Integration & Event Tracker
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Programmatically register or update your HTTP endpoint for Brevo transactional
                      email event notifications.
                    </p>
                  </div>

                  {brevoWebhookId ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      Active Webhook ID #{brevoWebhookId}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600 dark:bg-navy-800 dark:text-gray-300">
                      No Active Webhook
                    </span>
                  )}
                </div>

                {/* Input Controls */}
                <div className="space-y-3 pt-2">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                    Target Webhook Endpoint URL
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <input
                        type="url"
                        value={webhookUrlInput}
                        onChange={(e) => setWebhookUrlInput(e.target.value)}
                        placeholder="https://api.yourdomain.com/api/v1/webhooks/brevo"
                        className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-xs text-gray-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-navy-700 dark:bg-navy-800 dark:text-white dark:focus:border-brand-400 font-mono"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleRegisterWebhook}
                      disabled={isRegisteringWebhook}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-500 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-brand-500/20 hover:bg-brand-600 transition-all disabled:opacity-50 shrink-0"
                    >
                      {isRegisteringWebhook ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Webhook size={14} />
                      )}
                      <span>{brevoWebhookId ? 'Update Webhook' : 'Register Webhook'}</span>
                    </button>

                    {brevoWebhookId && (
                      <button
                        type="button"
                        onClick={handleUnregisterWebhook}
                        disabled={isUnregisteringWebhook}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-900/20 dark:text-rose-400 dark:hover:bg-rose-900/30 transition-all disabled:opacity-50 shrink-0"
                      >
                        {isUnregisteringWebhook ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Trash2 size={14} />
                        )}
                        <span>Unregister</span>
                      </button>
                    )}
                  </div>

                  {/* Registered Webhook Metadata */}
                  {brevoWebhookId && (
                    <div className="rounded-2xl bg-emerald-50/50 border border-emerald-100 p-4 text-xs dark:bg-emerald-950/10 dark:border-emerald-900/30 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-900 dark:text-emerald-300">
                          Subscribed Transactional Events:
                        </span>
                        <span className="font-mono text-[11px] text-emerald-700 dark:text-emerald-400">
                          12 Event Callbacks Active
                        </span>
                      </div>
                      <p className="text-emerald-800/80 dark:text-emerald-400/80 text-[11px] font-mono">
                        Events: sent, delivered, request, hardBounce, softBounce, blocked, spam,
                        invalid, deferred, click, opened, unsubscribed
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick Specs Sidebar Card */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-navy-800 dark:bg-navy-900 space-y-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <ShieldCheck size={16} className="text-brand-500" />
                Integration Specifications
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-navy-800">
                  <span className="text-gray-500">System Key</span>
                  <span className="font-mono font-bold text-brand-600 dark:text-brand-400">
                    {plugin.pluginKey}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-navy-800">
                  <span className="text-gray-500">System Usage Status</span>
                  <span
                    className={`font-extrabold ${
                      plugin.isEnabled
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-blue-600 dark:text-blue-400'
                    }`}
                  >
                    {plugin.isEnabled ? 'Used in Current' : 'Available for Use'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-navy-800">
                  <span className="text-gray-500">Environment Mode</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">
                    {plugin.isTestMode ? 'Sandbox' : 'Production'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-500">Configured Secret Keys</span>
                  <span className="font-mono font-bold text-gray-700 dark:text-gray-300">
                    {Object.keys(plugin.credentials || {}).length} configured
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(true)}
                  className="w-full rounded-xl bg-gray-900 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-black dark:bg-navy-700 dark:hover:bg-navy-600 flex items-center justify-center gap-2"
                >
                  <Settings2 size={14} />
                  <span>Edit Credentials</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Credentials & Settings */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-navy-800 dark:bg-navy-900 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Key size={18} className="text-brand-500" />
                  Configured API Credentials
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Sensitives secrets are securely masked. Click copy to copy key references.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsDrawerOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-brand-500/20 hover:bg-brand-600 transition-all"
              >
                <Settings2 size={14} />
                <span>Update Credentials</span>
              </button>
            </div>

            {/* Credentials JSON / Key List */}
            {Object.keys(plugin.credentials || {}).length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-xs text-gray-500 dark:border-navy-700 dark:text-gray-400">
                No credentials currently configured for this integration.
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(plugin.credentials || {}).map(([key, val]) => (
                  <div
                    key={key}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-2xl border border-gray-100 bg-gray-50/50 p-4 text-xs dark:border-navy-800 dark:bg-navy-800/40"
                  >
                    <div>
                      <span className="font-mono font-bold text-gray-900 dark:text-white">
                        {key}
                      </span>
                      <span className="block text-[11px] text-gray-400">
                        {typeof val === 'string' && val.includes('••••')
                          ? 'Encrypted Secret Key'
                          : 'Value'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <code className="rounded-lg bg-white px-3 py-1.5 font-mono text-gray-700 dark:bg-navy-900 dark:text-gray-300 border border-gray-200 dark:border-navy-700">
                        {String(val)}
                      </code>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(String(val), key)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:text-gray-900 dark:border-navy-700 dark:bg-navy-800 dark:text-gray-400 dark:hover:text-white"
                        title="Copy to clipboard"
                      >
                        {copiedField === key ? (
                          <Check size={14} className="text-emerald-500" />
                        ) : (
                          <Copy size={14} />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Plugin Custom Settings & Metadata Viewer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-navy-800 dark:bg-navy-900 space-y-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Plugin Settings Schema
              </h3>
              <pre className="rounded-2xl bg-gray-900 p-4 font-mono text-xs text-gray-200 overflow-x-auto">
                {JSON.stringify(plugin.settings || {}, null, 2)}
              </pre>
            </div>

            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-navy-800 dark:bg-navy-900 space-y-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Integration Metadata
              </h3>
              <pre className="rounded-2xl bg-gray-900 p-4 font-mono text-xs text-gray-200 overflow-x-auto">
                {JSON.stringify(plugin.metadata || {}, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Health & Activity Logs */}
      {activeTab === 'logs' && (
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-navy-800 dark:bg-navy-900 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FileText size={18} className="text-brand-500" />
                Integration Health & Execution Logs
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Recent health test logs and system event history for {plugin.name}
              </p>
            </div>

            <button
              type="button"
              onClick={() => onTestConnection(plugin.pluginKey)}
              disabled={isTesting}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-navy-700 dark:bg-navy-800 dark:text-gray-200 dark:hover:bg-navy-700"
            >
              <RefreshCw size={13} className={isTesting ? 'animate-spin' : ''} />
              <span>Trigger Test Log</span>
            </button>
          </div>

          {/* Log Items List */}
          <div className="space-y-3">
            {mockLogs.map((log) => (
              <div
                key={log.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-gray-50/50 p-4 text-xs dark:border-navy-800 dark:bg-navy-800/40"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                      log.status === 'SUCCESS'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : log.status === 'FAILED'
                          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                          : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                    }`}
                  >
                    {log.status === 'SUCCESS' ? (
                      <CheckCircle2 size={15} />
                    ) : log.status === 'FAILED' ? (
                      <XCircle size={15} />
                    ) : (
                      <Activity size={15} />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 dark:text-white">{log.event}</span>
                      <span className="rounded bg-gray-200 px-1.5 py-0.5 text-[10px] font-mono text-gray-600 dark:bg-navy-700 dark:text-gray-300">
                        {log.type}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{log.message}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 text-right sm:text-right">
                  <span className="font-mono text-[11px] text-gray-400">
                    {log.responseTimeMs} ms
                  </span>
                  <span className="font-mono text-[11px] text-gray-500 dark:text-gray-400">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Plugin Configuration Drawer */}
      <PluginConfigDrawer
        plugin={plugin}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSave={onUpdatePlugin}
        onTestConnection={onTestConnection}
      />
    </div>
  );
}
