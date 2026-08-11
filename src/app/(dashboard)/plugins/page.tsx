'use client';

import React, { useState } from 'react';
import { usePlugins } from '@/modules/plugins/hooks/usePlugins';
import { PluginHeader } from '@/modules/plugins/components/PluginHeader';
import { PluginStatsBar } from '@/modules/plugins/components/PluginStatsBar';
import { PluginStatusTabs } from '@/modules/plugins/components/PluginStatusTabs';
import { CategoryTabs } from '@/modules/plugins/components/CategoryTabs';
import { PluginCard } from '@/modules/plugins/components/PluginCard';
import { PluginConfigDrawer } from '@/modules/plugins/components/PluginConfigDrawer';
import { CreatePluginModal } from '@/modules/plugins/components/CreatePluginModal';
import { PluginItem } from '@/types/plugin.types';
import { Blocks, CheckCircle2, Sparkles } from 'lucide-react';

export default function PluginsPage() {
  const {
    plugins,
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
    refresh,
    toggleStatus,
    testConnection,
    updatePlugin,
    createPlugin,
  } = usePlugins();

  const [activeConfigurePlugin, setActiveConfigurePlugin] = useState<PluginItem | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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

      {/* Summary Statistics Bar (Clickable cards switch views) */}
      <PluginStatsBar
        totalCount={totalCount}
        usedCount={usedCount}
        availableCount={availableCount}
        verifiedCount={verifiedCount}
        statusFilter={statusFilter}
        onSelectStatus={setStatusFilter}
      />

      {/* Primary View Switcher: Used in Current vs Available for Use vs All */}
      <PluginStatusTabs
        statusFilter={statusFilter}
        onSelectStatus={setStatusFilter}
        usedCount={usedCount}
        availableCount={availableCount}
        totalCount={totalCount}
      />

      {/* Category Filter Tabs */}
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
                <div className="h-5 w-24 rounded-md bg-gray-200 dark:bg-navy-700" />
                <div className="h-5 w-9 rounded-full bg-gray-200 dark:bg-navy-700" />
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
            {statusFilter === 'used' ? (
              <CheckCircle2 size={32} className="text-emerald-500" />
            ) : statusFilter === 'available' ? (
              <Sparkles size={32} className="text-blue-500" />
            ) : (
              <Blocks size={32} />
            )}
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {statusFilter === 'used'
              ? 'No Plugins Currently Used in System'
              : statusFilter === 'available'
                ? 'No Available (Disabled) Plugins'
                : 'No Integration Plugins Found'}
          </h3>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 max-w-md">
            {searchQuery
              ? `No integrations match your search query "${searchQuery}".`
              : statusFilter === 'used'
                ? 'No 3rd party plugins are currently enabled. Switch to "Available for Use" tab to configure and activate integrations.'
                : statusFilter === 'available'
                  ? 'All registered 3rd party plugins are currently enabled and active in the system!'
                  : 'No 3rd party plugins are registered for this category.'}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            {statusFilter === 'used' && (
              <button
                type="button"
                onClick={() => setStatusFilter('available')}
                className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all"
              >
                Browse Available Plugins ({availableCount})
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="rounded-xl bg-brand-500 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-brand-500/20 hover:bg-brand-600 transition-all"
            >
              Add New Integration
            </button>
          </div>
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

      {/* Modal for Registering New Plugin */}
      <CreatePluginModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={createPlugin}
      />
    </div>
  );
}
