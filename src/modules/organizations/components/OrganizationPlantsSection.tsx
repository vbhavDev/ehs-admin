'use client';

import React, { useEffect, useState } from 'react';
import {
  Building2,
  Search,
  Factory,
  Warehouse,
  HardHat,
  Briefcase,
  Flame,
  Loader2,
  MapPin,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { adminPlantsService, PlantItem } from '@/services/plants.service';
import { Organization } from '@/types/organization.types';

interface OrganizationPlantsSectionProps {
  organization: Organization;
}

const TYPE_CONFIG: Record<
  string,
  { label: string; icon: React.ElementType; color: string; bg: string; border: string }
> = {
  MANUFACTURING: {
    label: 'Manufacturing',
    icon: Factory,
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/20',
  },
  WAREHOUSE: {
    label: 'Warehouse',
    icon: Warehouse,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
  },
  CONSTRUCTION_SITE: {
    label: 'Construction Site',
    icon: HardHat,
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
  },
  OFFICE: {
    label: 'Corporate Office',
    icon: Briefcase,
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/20',
  },
  REFINERY: {
    label: 'Refinery / Chemical',
    icon: Flame,
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
  },
  OTHER: {
    label: 'Operational Site',
    icon: Building2,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
  },
};

import { PlantFormModal } from './PlantFormModal';

export const OrganizationPlantsSection: React.FC<OrganizationPlantsSectionProps> = ({
  organization,
}) => {
  const [plants, setPlants] = useState<PlantItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [modalMode, setModalMode] = useState<'CREATE' | 'EDIT' | null>(null);
  const [activePlant, setActivePlant] = useState<PlantItem | null>(null);

  useEffect(() => {
    loadPlants();
  }, [organization.id]);

  const loadPlants = async () => {
    setLoading(true);
    try {
      const res = await adminPlantsService.getPlants({ orgId: organization.id, limit: 100 });
      setPlants(res.data || []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  const filteredPlants = plants.filter((p) => {
    if (!searchQuery) return true;
    return (
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleOpenCreate = () => {
    setActivePlant(null);
    setModalMode('CREATE');
  };

  const handleOpenEdit = (plant: PlantItem) => {
    setActivePlant(plant);
    setModalMode('EDIT');
  };

  return (
    <div className="rounded-2xl border border-gray-100 dark:border-navy-700 bg-white dark:bg-navy-800 p-6 shadow-sm space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Building2 size={18} className="text-blue-500" />
            Registered Plant Facilities
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            All active sites and operational facilities associated with {organization.companyName}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search sites..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 rounded-xl border border-gray-200 dark:border-navy-600 bg-gray-50 dark:bg-navy-900 pl-9 pr-3 py-2 text-sm text-gray-900 dark:text-white focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <button
            onClick={handleOpenCreate}
            className="flex h-[38px] items-center gap-2 rounded-xl bg-brand-500 px-4 text-xs font-semibold text-white transition hover:bg-brand-600 shadow-sm shadow-brand-500/20 whitespace-nowrap"
          >
            <Building2 size={16} /> Add Plant
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex h-32 items-center justify-center rounded-xl bg-gray-50 dark:bg-navy-900/50">
          <Loader2 size={24} className="animate-spin text-brand-500" />
        </div>
      ) : filteredPlants.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 dark:border-navy-700 p-10 text-center">
          <Building2 size={32} className="text-gray-300 dark:text-navy-500 mb-3" />
          <p className="text-sm font-semibold text-gray-900 dark:text-white">No facilities found</p>
          <p className="text-xs text-gray-500 max-w-sm mt-1 mb-5">
            This organization has not registered any operational plants or sites yet.
          </p>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600 shadow-sm shadow-brand-500/20"
          >
            <Building2 size={16} /> Register First Plant
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlants.map((plant) => {
            const typeInfo = TYPE_CONFIG[plant.type] || TYPE_CONFIG.OTHER;
            const TypeIcon = typeInfo.icon;

            return (
              <div
                key={plant.id || plant._id}
                className="group flex flex-col justify-between overflow-hidden rounded-xl border border-gray-100 dark:border-navy-700 bg-white dark:bg-navy-900/50 p-4 transition-all hover:border-brand-500/50 hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="rounded bg-gray-100 dark:bg-navy-700 px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                      {plant.code}
                    </span>
                    <span
                      className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border ${typeInfo.bg} ${typeInfo.color} ${typeInfo.border}`}
                    >
                      <TypeIcon size={10} />
                      {typeInfo.label}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1 mb-1">
                    {plant.name}
                  </h4>

                  <div className="flex items-start gap-1.5 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                    <MapPin size={12} className="shrink-0 mt-0.5" />
                    <span>
                      {[plant.address?.street, plant.address?.city, plant.address?.state]
                        .filter(Boolean)
                        .join(', ') || 'No address provided'}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-gray-100 dark:border-navy-700/60 pt-3">
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500">
                    {plant.isActive ? (
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 size={12} /> Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-gray-400">
                        <XCircle size={12} /> Inactive
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-gray-400">
                      {plant.createdAt
                        ? new Date(plant.createdAt).toLocaleDateString()
                        : 'Recently'}
                    </span>
                    <button
                      onClick={() => handleOpenEdit(plant)}
                      className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <PlantFormModal
        isOpen={modalMode !== null}
        onClose={() => setModalMode(null)}
        orgId={organization.id}
        mode={modalMode}
        plantData={activePlant}
        onSuccess={loadPlants}
      />
    </div>
  );
};
