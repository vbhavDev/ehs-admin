'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { AlertTriangle, Plug, Settings, Activity } from 'lucide-react';
import Button from '@/components/ui/button/Button';
import Badge from '@/components/ui/badge/Badge';
import { pluginService, Plugin } from '@/services/plugin.service';
import Link from 'next/link';

export default function PluginsPage() {
  const { user } = useAuthStore();
  const isSuperAdmin = user?.role?.roleKey === 'super_admin';

  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isSuperAdmin) {
      loadPlugins();
    }
  }, [isSuperAdmin]);

  const loadPlugins = async () => {
    try {
      setIsLoading(true);
      const res = await pluginService.getPlugins();
      setPlugins(res.data);
    } catch (error) {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-500/10 text-red-500 flex items-center justify-center">
          <AlertTriangle size={32} />
        </div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Access Denied</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-md">
          Only users with the Super Admin role have permission to configure plugins.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Plugins & Integrations</h1>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
          Manage system plugins, AI engines, and external API integrations.
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-gray-500">Loading plugins...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plugins.map((plugin) => (
            <div
              key={plugin.id}
              className="bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden flex flex-col"
            >
              <div className="absolute top-6 right-6 flex space-x-2">
                <Badge color={plugin.isEnabled ? 'success' : 'warning'} variant="light">
                  {plugin.isEnabled ? 'Active' : 'Disabled'}
                </Badge>
              </div>

              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-navy-800 flex items-center justify-center text-gray-600 dark:text-gray-300">
                  <Plug size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg">{plugin.name}</h3>
                  <p className="text-xs font-medium text-brand-500 uppercase tracking-wider">
                    {plugin.category}
                  </p>
                </div>
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 flex-grow">
                {plugin.description || 'No description provided.'}
              </p>

              <div className="flex space-x-3 mt-auto">
                {plugin.category === 'AI' && (
                  <Link href={`/plugins/${plugin.pluginKey}/usage`} className="flex-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      startIcon={<Activity size={14} />}
                    >
                      Usage & Logs
                    </Button>
                  </Link>
                )}
                <Link href={`/plugins/${plugin.pluginKey}`} className="flex-1">
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full"
                    startIcon={<Settings size={14} />}
                  >
                    Configure
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
