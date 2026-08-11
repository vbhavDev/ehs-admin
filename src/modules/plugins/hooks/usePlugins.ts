'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { pluginsService } from '@/services/plugins.service';
import {
  PluginItem,
  PluginCategory,
  CreatePluginData,
  UpdatePluginData,
} from '@/types/plugin.types';

export function usePlugins() {
  const [plugins, setPlugins] = useState<PluginItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<PluginCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [testingKeys, setTestingKeys] = useState<Record<string, boolean>>({});

  const fetchPlugins = useCallback(async () => {
    try {
      setIsLoading(true);
      const categoryParam = selectedCategory === 'all' ? undefined : selectedCategory;
      const data = await pluginsService.getPlugins({
        category: categoryParam,
        search: searchQuery || undefined,
      });
      setPlugins(data);
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message || 'Failed to load plugins list';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    fetchPlugins();
  }, [fetchPlugins]);

  const toggleStatus = async (key: string, currentStatus: boolean) => {
    try {
      // Optimistic update
      setPlugins((prev) =>
        prev.map((p) => (p.pluginKey === key ? { ...p, isEnabled: !currentStatus } : p)),
      );

      const updated = await pluginsService.togglePluginStatus(key, !currentStatus);
      toast.success(
        `Plugin '${updated.name}' is now ${updated.isEnabled ? 'ENABLED' : 'DISABLED'}`,
      );
      fetchPlugins();
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message || 'Failed to toggle plugin status';
      toast.error(message);
      fetchPlugins(); // revert
    }
  };

  const testConnection = async (key: string) => {
    try {
      setTestingKeys((prev) => ({ ...prev, [key]: true }));
      const result = await pluginsService.testConnection(key);

      if (result.status === 'success') {
        toast.success(`[${result.name}] ${result.message}`);
      } else {
        toast.error(`[${result.name}] ${result.message}`);
      }

      fetchPlugins();
      return result;
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message || 'Failed to test connection';
      toast.error(message);
    } finally {
      setTestingKeys((prev) => ({ ...prev, [key]: false }));
    }
  };

  const updatePlugin = async (key: string, data: UpdatePluginData) => {
    try {
      const updated = await pluginsService.updatePlugin(key, data);
      toast.success(`Updated integration settings for ${updated.name}`);
      fetchPlugins();
      return updated;
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message || 'Failed to update plugin';
      toast.error(message);
      throw err;
    }
  };

  const createPlugin = async (data: CreatePluginData) => {
    try {
      const created = await pluginsService.createPlugin(data);
      toast.success(`Registered new 3rd party integration: ${created.name}`);
      fetchPlugins();
      return created;
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message || 'Failed to create plugin';
      toast.error(message);
      throw err;
    }
  };

  return {
    plugins,
    isLoading,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    testingKeys,
    refresh: fetchPlugins,
    toggleStatus,
    testConnection,
    updatePlugin,
    createPlugin,
  };
}
