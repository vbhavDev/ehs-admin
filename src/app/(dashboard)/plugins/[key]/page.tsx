'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { pluginsService } from '@/services/plugins.service';
import { PluginItem, UpdatePluginData } from '@/types/plugin.types';
import { PluginDetailView } from '@/modules/plugins/components/PluginDetailView';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function PluginDetailPage() {
  const params = useParams();
  const router = useRouter();
  const pluginKey = params?.key as string;

  const [plugin, setPlugin] = useState<PluginItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const fetchPlugin = useCallback(async () => {
    if (!pluginKey) return;
    try {
      setIsLoading(true);
      setError(null);
      const data = await pluginsService.getPluginByKey(pluginKey);
      setPlugin(data);
    } catch (err: unknown) {
      const message =
        (err as { message?: string })?.message || `Failed to fetch plugin '${pluginKey}'`;
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [pluginKey]);

  useEffect(() => {
    fetchPlugin();
  }, [fetchPlugin]);

  const handleToggleStatus = async (key: string, currentStatus: boolean) => {
    try {
      const updated = await pluginsService.togglePluginStatus(key, !currentStatus);
      setPlugin(updated);
      toast.success(
        `Plugin '${updated.name}' is now ${updated.isEnabled ? 'ENABLED (Used in Current)' : 'DISABLED (Available for Use)'}`,
      );
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message || 'Failed to toggle status';
      toast.error(message);
    }
  };

  const handleTestConnection = async (key: string) => {
    try {
      setIsTesting(true);
      const result = await pluginsService.testConnection(key);
      if (result.status === 'success') {
        toast.success(`[${result.name}] ${result.message}`);
      } else {
        toast.error(`[${result.name}] ${result.message}`);
      }
      await fetchPlugin();
      return result;
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message || 'Failed to test connection';
      toast.error(message);
      throw err;
    } finally {
      setIsTesting(false);
    }
  };

  const handleUpdatePlugin = async (key: string, data: UpdatePluginData) => {
    try {
      const updated = await pluginsService.updatePlugin(key, data);
      setPlugin(updated);
      toast.success(`Updated integration settings for ${updated.name}`);
      return updated;
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message || 'Failed to update plugin';
      toast.error(message);
      throw err;
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 w-full items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3 text-gray-500 dark:text-gray-400">
          <Loader2 size={32} className="animate-spin text-brand-500" />
          <span className="text-xs font-semibold">Loading plugin details...</span>
        </div>
      </div>
    );
  }

  if (error || !plugin) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 mx-auto dark:bg-rose-500/10">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Plugin Not Found</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {error || `Plugin integration with key '${pluginKey}' could not be located.`}
        </p>
        <button
          type="button"
          onClick={() => router.push('/plugins')}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-600 transition-all"
        >
          <ArrowLeft size={16} />
          <span>Return to Plugins List</span>
        </button>
      </div>
    );
  }

  return (
    <PluginDetailView
      plugin={plugin}
      onToggleStatus={handleToggleStatus}
      onTestConnection={handleTestConnection}
      onUpdatePlugin={handleUpdatePlugin}
      isTesting={isTesting}
    />
  );
}
