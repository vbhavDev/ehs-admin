'use client';

import React, { useState, useEffect } from 'react';
import { PluginItem, UpdatePluginData } from '@/types/plugin.types';
import {
  X,
  Eye,
  EyeOff,
  Save,
  Activity,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';

interface PluginConfigDrawerProps {
  plugin: PluginItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (key: string, data: UpdatePluginData) => Promise<unknown>;
  onTestConnection: (key: string) => Promise<unknown>;
}

export function PluginConfigDrawer({
  plugin,
  isOpen,
  onClose,
  onSave,
  onTestConnection,
}: PluginConfigDrawerProps) {
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [isTestMode, setIsTestMode] = useState(true);
  const [isEnabled, setIsEnabled] = useState(false);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ status: string; message: string } | null>(null);

  useEffect(() => {
    if (plugin) {
      setIsTestMode(plugin.isTestMode);
      setIsEnabled(plugin.isEnabled);

      // Convert credentials to string values for form inputs
      const initialCreds: Record<string, string> = {};
      if (plugin.credentials) {
        Object.entries(plugin.credentials).forEach(([k, v]) => {
          initialCreds[k] = typeof v === 'object' ? JSON.stringify(v) : String(v ?? '');
        });
      }
      setCredentials(initialCreds);

      // Convert settings to string values for form inputs
      const initialSettings: Record<string, string> = {};
      if (plugin.settings) {
        Object.entries(plugin.settings).forEach(([k, v]) => {
          initialSettings[k] = typeof v === 'object' ? JSON.stringify(v) : String(v ?? '');
        });
      }
      setSettings(initialSettings);
      setTestResult(null);
    }
  }, [plugin]);

  if (!isOpen || !plugin) return null;

  const handleCredentialChange = (field: string, value: string) => {
    setCredentials((prev) => ({ ...prev, [field]: value }));
  };

  const handleSettingChange = (field: string, value: string) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const toggleShowSecret = (field: string) => {
    setShowSecrets((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await onSave(plugin.pluginKey, {
        isTestMode,
        isEnabled,
        credentials,
        settings,
      });
      onClose();
    } catch {
      // Handled in hook toast
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    try {
      setIsTesting(true);
      setTestResult(null);
      const res = (await onTestConnection(plugin.pluginKey)) as
        | { status: string; message: string }
        | null
        | undefined;
      if (res && typeof res.status === 'string' && typeof res.message === 'string') {
        setTestResult({ status: res.status, message: res.message });
      }
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-sm transition-opacity">
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-xl bg-white dark:bg-navy-800 shadow-2xl flex flex-col justify-between border-l border-gray-200 dark:border-navy-700">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-navy-700">
            <div>
              <span className="rounded-md bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                {plugin.category.toUpperCase()}
              </span>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                Configure {plugin.name}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Manage API credentials, sandbox environment, and provider parameters
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-navy-700 dark:hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          {/* Form Content */}
          <form
            id="plugin-config-form"
            onSubmit={handleSave}
            className="flex-1 overflow-y-auto p-6 space-y-6"
          >
            {/* Status & Environment Toggles */}
            <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 space-y-4 dark:border-navy-700 dark:bg-navy-900/40">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-gray-900 dark:text-white">
                    Integration Active
                  </label>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    Enable or disable this 3rd party service across the platform
                  </p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={isEnabled}
                    onChange={(e) => setIsEnabled(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-brand-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none dark:border-navy-600 dark:bg-navy-700" />
                </label>
              </div>

              <div className="flex items-center justify-between border-t border-gray-200/60 pt-3 dark:border-navy-700/60">
                <div>
                  <label className="text-xs font-bold text-gray-900 dark:text-white">
                    Sandbox / Test Mode
                  </label>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    Use test credentials to avoid live charges or SMS sends
                  </p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={isTestMode}
                    onChange={(e) => setIsTestMode(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="peer h-6 w-11 rounded-full bg-amber-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-amber-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-amber-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none dark:bg-navy-700" />
                </label>
              </div>
            </div>

            {/* API Credentials Section */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-3 flex items-center gap-1.5">
                <Info size={13} /> API Credentials & Secret Keys
              </h3>
              <div className="space-y-3.5">
                {Object.keys(credentials).length === 0 ? (
                  <p className="text-xs text-gray-400 italic">
                    No credentials configured for this provider.
                  </p>
                ) : (
                  Object.entries(credentials).map(([fieldKey, value]) => {
                    const isSecret =
                      fieldKey.toLowerCase().includes('key') ||
                      fieldKey.toLowerCase().includes('secret') ||
                      fieldKey.toLowerCase().includes('token') ||
                      fieldKey.toLowerCase().includes('password');

                    return (
                      <div key={fieldKey}>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 capitalize">
                          {fieldKey.replace(/([A-Z])/g, ' $1')}
                        </label>
                        <div className="relative">
                          <input
                            type={isSecret && !showSecrets[fieldKey] ? 'password' : 'text'}
                            value={value}
                            onChange={(e) => handleCredentialChange(fieldKey, e.target.value)}
                            placeholder={`Enter ${fieldKey}`}
                            className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-3 pr-10 text-xs font-mono text-gray-900 outline-none transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-navy-700 dark:bg-navy-900 dark:text-white"
                          />
                          {isSecret && (
                            <button
                              type="button"
                              onClick={() => toggleShowSecret(fieldKey)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            >
                              {showSecrets[fieldKey] ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Provider Specific Settings */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-3">
                Provider Configuration Settings
              </h3>
              <div className="space-y-3.5">
                {Object.keys(settings).length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No additional settings required.</p>
                ) : (
                  Object.entries(settings).map(([fieldKey, value]) => (
                    <div key={fieldKey}>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 capitalize">
                        {fieldKey.replace(/([A-Z])/g, ' $1')}
                      </label>
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => handleSettingChange(fieldKey, e.target.value)}
                        placeholder={`Enter ${fieldKey}`}
                        className="w-full rounded-xl border border-gray-200 bg-white py-2 px-3 text-xs text-gray-900 outline-none transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-navy-700 dark:bg-navy-900 dark:text-white"
                      />
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Live Test Feedback Banner */}
            {testResult && (
              <div
                className={`rounded-xl p-3 text-xs flex items-start gap-2.5 ${
                  testResult.status === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20'
                    : 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/20'
                }`}
              >
                {testResult.status === 'success' ? (
                  <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-600" />
                ) : (
                  <AlertTriangle size={16} className="shrink-0 mt-0.5 text-rose-600" />
                )}
                <div>
                  <p className="font-bold">Connection Test {testResult.status.toUpperCase()}</p>
                  <p className="mt-0.5 text-[11px] opacity-90">{testResult.message}</p>
                </div>
              </div>
            )}
          </form>

          {/* Drawer Actions */}
          <div className="border-t border-gray-100 p-4 bg-gray-50/50 dark:border-navy-700 dark:bg-navy-900/60 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleTest}
              disabled={isTesting}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-navy-700 dark:bg-navy-800 dark:text-gray-200 dark:hover:bg-navy-700 disabled:opacity-50"
            >
              {isTesting ? (
                <Loader2 size={14} className="animate-spin text-brand-500" />
              ) : (
                <Activity size={14} className="text-brand-500" />
              )}
              Test API Connection
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-200/60 dark:text-gray-300 dark:hover:bg-navy-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="plugin-config-form"
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-500 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-brand-500/20 transition-all hover:bg-brand-600 disabled:opacity-50"
              >
                {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
