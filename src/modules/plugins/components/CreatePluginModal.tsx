'use client';

import React, { useState } from 'react';
import { CreatePluginData, PluginCategory } from '@/types/plugin.types';
import { X, Plus, Trash2, Loader2, Blocks } from 'lucide-react';

interface CreatePluginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: CreatePluginData) => Promise<unknown>;
}

export function CreatePluginModal({ isOpen, onClose, onCreate }: CreatePluginModalProps) {
  const [pluginKey, setPluginKey] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<PluginCategory>('other');
  const [provider, setProvider] = useState('');
  const [icon, setIcon] = useState('plug');
  const isTestMode = true;
  const isEnabled = false;
  const [credFields, setCredFields] = useState<{ key: string; value: string }[]>([
    { key: 'apiKey', value: '' },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleAddCredField = () => {
    setCredFields((prev) => [...prev, { key: '', value: '' }]);
  };

  const handleRemoveCredField = (index: number) => {
    setCredFields((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCredFieldChange = (index: number, field: 'key' | 'value', val: string) => {
    setCredFields((prev) => {
      const copy = [...prev];
      if (copy[index]) {
        copy[index][field] = val;
      }
      return copy;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pluginKey || !name || !provider) return;

    const credentialsObj: Record<string, string> = {};
    credFields.forEach((item) => {
      if (item.key.trim()) {
        credentialsObj[item.key.trim()] = item.value;
      }
    });

    try {
      setIsSubmitting(true);
      await onCreate({
        pluginKey: pluginKey.trim().toLowerCase().replace(/\s+/g, '-'),
        name: name.trim(),
        description: description.trim(),
        category,
        provider: provider.trim().toLowerCase(),
        icon,
        isTestMode,
        isEnabled,
        credentials: credentialsObj,
      });
      onClose();
    } catch {
      // Handled in toast
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-navy-800 shadow-2xl border border-gray-200 dark:border-navy-700 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-navy-700">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-white">
              <Blocks size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Register New 3rd Party Integration
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Add a new modular plugin integration definition to the system
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-navy-700 dark:hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Plugin Key *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. razorpay-pro"
                value={pluginKey}
                onChange={(e) => setPluginKey(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white py-2 px-3 text-xs text-gray-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-navy-700 dark:bg-navy-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Display Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Razorpay Payment Pro"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white py-2 px-3 text-xs text-gray-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-navy-700 dark:bg-navy-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              placeholder="Brief summary of this 3rd party integration..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white py-2 px-3 text-xs text-gray-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-navy-700 dark:bg-navy-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as PluginCategory)}
                className="w-full rounded-xl border border-gray-200 bg-white py-2 px-3 text-xs text-gray-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-navy-700 dark:bg-navy-900 dark:text-white"
              >
                <option value="email">Email</option>
                <option value="payment">Payment</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="sms">SMS</option>
                <option value="storage">Storage</option>
                <option value="ai">AI / Vision</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Provider Slug *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. razorpay"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white py-2 px-3 text-xs text-gray-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-navy-700 dark:bg-navy-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Icon Name
              </label>
              <select
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white py-2 px-3 text-xs text-gray-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-navy-700 dark:bg-navy-900 dark:text-white"
              >
                <option value="plug">Plug</option>
                <option value="mail">Mail</option>
                <option value="send">Send</option>
                <option value="credit-card">Credit Card</option>
                <option value="wallet">Wallet</option>
                <option value="dollar-sign">Dollar Sign</option>
                <option value="message-square">WhatsApp</option>
                <option value="smartphone">SMS</option>
                <option value="database">Storage</option>
                <option value="cpu">AI / CPU</option>
              </select>
            </div>
          </div>

          {/* Initial Credentials Fields */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-gray-900 dark:text-white">
                Credentials Definition Fields
              </label>
              <button
                type="button"
                onClick={handleAddCredField}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-600 hover:underline dark:text-brand-400"
              >
                <Plus size={13} /> Add Field
              </button>
            </div>

            <div className="space-y-2">
              {credFields.map((field, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Field name (e.g. apiKey)"
                    value={field.key}
                    onChange={(e) => handleCredFieldChange(idx, 'key', e.target.value)}
                    className="w-1/2 rounded-xl border border-gray-200 bg-white py-1.5 px-3 text-xs text-gray-900 outline-none focus:border-brand-500 dark:border-navy-700 dark:bg-navy-900 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="Initial value (optional)"
                    value={field.value}
                    onChange={(e) => handleCredFieldChange(idx, 'value', e.target.value)}
                    className="w-1/2 rounded-xl border border-gray-200 bg-white py-1.5 px-3 text-xs text-gray-900 outline-none focus:border-brand-500 dark:border-navy-700 dark:bg-navy-900 dark:text-white"
                  />
                  {credFields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveCredField(idx)}
                      className="p-1.5 text-gray-400 hover:text-rose-500"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="border-t border-gray-100 pt-4 dark:border-navy-700 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-navy-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-500 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-brand-500/20 transition-all hover:bg-brand-600 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              Register Integration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
