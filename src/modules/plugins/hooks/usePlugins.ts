'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { pluginsService } from '@/services/plugins.service';
import {
  PluginItem,
  PluginCategory,
  CreatePluginData,
  UpdatePluginData,
} from '@/types/plugin.types';

export type PluginStatusFilter = 'all' | 'used' | 'available';

export function usePlugins() {
  const [plugins, setPlugins] = useState<PluginItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<PluginCategory | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<PluginStatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [testingKeys, setTestingKeys] = useState<Record<string, boolean>>({});

  const fetchPlugins = useCallback(async () => {
    try {
      setIsLoading(true);
      // Fetch all plugins for client-side multi-dimensional filtering & counts
      const data = await pluginsService.getPlugins({});
      setPlugins(data);
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message || 'Failed to load plugins list';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlugins();
  }, [fetchPlugins]);

  // Overall metric counts
  const totalCount = plugins.length;
  const usedCount = useMemo(() => plugins.filter((p) => p.isEnabled).length, [plugins]);
  const availableCount = useMemo(() => plugins.filter((p) => !p.isEnabled).length, [plugins]);
  const verifiedCount = useMemo(
    () => plugins.filter((p) => p.lastTestStatus === 'success').length,
    [plugins],
  );

  // Category counts based on current status filter
  const categoryCounts = useMemo(() => {
    const statusMatchingPlugins = plugins.filter((p) => {
      if (statusFilter === 'used') return p.isEnabled;
      if (statusFilter === 'available') return !p.isEnabled;
      return true;
    });

    const counts: Record<string, number> = { all: statusMatchingPlugins.length };
    statusMatchingPlugins.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [plugins, statusFilter]);

  // Filtered plugins array for current view
  const filteredPlugins = useMemo(() => {
    return plugins.filter((plugin) => {
      // 1. Status Filter
      if (statusFilter === 'used' && !plugin.isEnabled) return false;
      if (statusFilter === 'available' && plugin.isEnabled) return false;

      // 2. Category Filter
      if (selectedCategory !== 'all' && plugin.category !== selectedCategory) return false;

      // 3. Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const nameMatch = plugin.name.toLowerCase().includes(q);
        const keyMatch = plugin.pluginKey.toLowerCase().includes(q);
        const provMatch = plugin.provider.toLowerCase().includes(q);
        const catMatch = plugin.category.toLowerCase().includes(q);
        if (!nameMatch && !keyMatch && !provMatch && !catMatch) return false;
      }

      return true;
    });
  }, [plugins, statusFilter, selectedCategory, searchQuery]);

  const toggleStatus = async (key: string, currentStatus: boolean) => {
    try {
      // Optimistic update
      setPlugins((prev) =>
        prev.map((p) => (p.pluginKey === key ? { ...p, isEnabled: !currentStatus } : p)),
      );

      const updated = await pluginsService.togglePluginStatus(key, !currentStatus);
      toast.success(
        `Plugin '${updated.name}' is now ${updated.isEnabled ? 'ENABLED (Used in Current)' : 'DISABLED (Available for Use)'}`,
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
    plugins: filteredPlugins,
    rawPlugins: plugins,
    isLoading,
    selectedCategory,
    setSelectedCategory,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    totalCount,
    usedCount,
    availableCount,
    verifiedCount,
    categoryCounts,
    testingKeys,
    refresh: fetchPlugins,
    toggleStatus,
    testConnection,
    updatePlugin,
    createPlugin,
  };
}
