'use client';

import React, { useState, useMemo } from 'react';
import { usePlugins } from '@/modules/plugins/hooks/usePlugins';
import { PluginHeader } from '@/modules/plugins/components/PluginHeader';
import { CategoryTabs } from '@/modules/plugins/components/CategoryTabs';
import { PluginCard } from '@/modules/plugins/components/PluginCard';
import { PluginConfigDrawer } from '@/modules/plugins/components/PluginConfigDrawer';
import { CreatePluginModal } from '@/modules/plugins/components/CreatePluginModal';
import { PluginItem } from '@/types/plugin.types';
import { Blocks } from 'lucide-react';

export default function PluginsPage() {
  const {
    plugins,
    isLoading,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    testingKeys,
    refresh,
    toggleStatus,
    testConnection,
    updatePlugin,
    createPlugin,
  } = usePlugins();

  const [activeConfigurePlugin, setActiveConfigurePlugin] = useState<PluginItem | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Compute category counts for tab badges
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: plugins.length };
    plugins.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [plugins]);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto min-h-screen">
      {/* Top Bar / Header */}
      <PluginHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onRefresh={refresh}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        isRefreshing={isLoading}
      />

      {/* Category Tabs Filter */}
      <CategoryTabs
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        categoryCounts={categoryCounts}
      />

      {/* Content Area */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-64 rounded-2xl border border-gray-100 bg-white p-5 animate-pulse dark:border-navy-700 dark:bg-navy-800"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="h-5 w-20 rounded-md bg-gray-200 dark:bg-navy-700" />
                <div className="h-5 w-10 rounded-full bg-gray-200 dark:bg-navy-700" />
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-xl bg-gray-200 dark:bg-navy-700" />
                <div className="space-y-2">
                  <div className="h-4 w-32 rounded bg-gray-200 dark:bg-navy-700" />
                  <div className="h-3 w-20 rounded bg-gray-100 dark:bg-navy-700/60" />
                </div>
              </div>
              <div className="h-12 w-full rounded-xl bg-gray-100 dark:bg-navy-700/40 mb-4" />
              <div className="h-9 w-full rounded-xl bg-gray-200 dark:bg-navy-700" />
            </div>
          ))}
        </div>
      ) : plugins.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-white p-12 text-center dark:border-navy-700 dark:bg-navy-800/40">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-500 mb-4 dark:bg-brand-500/10">
            <Blocks size={32} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            No Integration Plugins Found
          </h3>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 max-w-sm">
            {searchQuery
              ? `No integrations match your search query "${searchQuery}".`
              : 'No 3rd party plugins are currently registered for this category.'}
          </p>
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="mt-5 rounded-xl bg-brand-500 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-brand-500/20 hover:bg-brand-600 transition-all"
          >
            Add New Integration
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {plugins.map((plugin) => (
            <PluginCard
              key={plugin.id || plugin.pluginKey}
              plugin={plugin}
              onToggleStatus={toggleStatus}
              onTestConnection={testConnection}
              onConfigure={(p) => setActiveConfigurePlugin(p)}
              isTesting={testingKeys[plugin.pluginKey]}
            />
          ))}
        </div>
      )}

      {/* Drawer for Configuration */}
      <PluginConfigDrawer
        plugin={activeConfigurePlugin}
        isOpen={Boolean(activeConfigurePlugin)}
        onClose={() => setActiveConfigurePlugin(null)}
        onSave={updatePlugin}
        onTestConnection={testConnection}
      />

      {/* Modal for Creating New Custom Plugin */}
      <CreatePluginModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={createPlugin}
      />
    </div>
  );
}
