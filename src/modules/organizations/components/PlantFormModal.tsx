'use client';

import React, { useEffect, useState } from 'react';
import { X, Factory, MapPin, FileText, AlertTriangle, Loader2, CheckCircle2 } from 'lucide-react';
import { PlantItem, adminPlantsService } from '@/services/plants.service';
import Button from '@/components/ui/button/Button';

interface PlantFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  orgId: string;
  mode: 'CREATE' | 'EDIT' | null;
  plantData?: PlantItem | null;
  onSuccess: () => void;
}

export const PlantFormModal: React.FC<PlantFormModalProps> = ({
  isOpen,
  onClose,
  orgId,
  mode,
  plantData,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'MANUFACTURING',
    street: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    isActive: true,
  });

  useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
      if (mode === 'EDIT' && plantData) {
        setFormData({
          name: plantData.name || '',
          code: plantData.code || '',
          type: plantData.type || 'MANUFACTURING',
          street: plantData.address?.street || '',
          city: plantData.address?.city || '',
          state: plantData.address?.state || '',
          pincode: plantData.address?.pincode || '',
          country: plantData.address?.country || 'India',
          isActive: plantData.isActive ?? true,
        });
      } else {
        setFormData({
          name: '',
          code: '',
          type: 'MANUFACTURING',
          street: '',
          city: '',
          state: '',
          pincode: '',
          country: 'India',
          isActive: true,
        });
      }
    }
  }, [isOpen, mode, plantData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) {
      setErrorMsg('Plant Name and Code are required');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const payload = {
        orgId, // needed if admin service requires it for creation, though usually URL param or body
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        type: formData.type as PlantItem['type'],
        isActive: formData.isActive,
        address: {
          street: formData.street.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          pincode: formData.pincode.trim(),
          country: formData.country.trim(),
        },
      };

      if (mode === 'CREATE') {
        // Wait, does adminPlantsService have createPlant? Let's add it if not!
        await adminPlantsService.createPlant(payload);
      } else if (mode === 'EDIT' && plantData) {
        const id = plantData.id || plantData._id;
        if (!id) throw new Error('Plant ID missing');
        await adminPlantsService.updatePlant(id, payload);
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      const errorObj = err as { message?: string; data?: { message?: string } };
      setErrorMsg(errorObj?.message || errorObj?.data?.message || 'Failed to save plant');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl rounded-2xl bg-white dark:bg-navy-800 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-navy-700 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
              <Factory size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {mode === 'CREATE' ? 'Register New Plant' : 'Update Plant Details'}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {mode === 'CREATE'
                  ? 'Add a new operational site to the organization'
                  : 'Modify the selected plant configuration'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-navy-700 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {errorMsg && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-4 text-sm text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
              <AlertTriangle size={18} />
              <p>{errorMsg}</p>
            </div>
          )}

          <form id="plant-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Primary Details Section */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
                <FileText size={16} className="text-brand-500" />
                Primary Details
              </h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Plant Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 dark:border-navy-600 dark:bg-navy-900 dark:text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
                    placeholder="e.g. Mumbai Refinery"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Plant Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value.toUpperCase() })
                    }
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 dark:border-navy-600 dark:bg-navy-900 dark:text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none uppercase"
                    placeholder="e.g. MUM-01"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Facility Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 dark:border-navy-600 dark:bg-navy-900 dark:text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
                  >
                    <option value="MANUFACTURING">Manufacturing</option>
                    <option value="WAREHOUSE">Warehouse</option>
                    <option value="CONSTRUCTION_SITE">Construction Site</option>
                    <option value="OFFICE">Corporate Office</option>
                    <option value="REFINERY">Refinery / Chemical</option>
                    <option value="OTHER">Other Operational Site</option>
                  </select>
                </div>

                <div className="space-y-1.5 flex flex-col justify-end">
                  <label className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 cursor-pointer dark:border-navy-600 dark:bg-navy-900">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="peer h-5 w-5 cursor-pointer appearance-none rounded border-2 border-gray-300 transition-all checked:border-emerald-500 checked:bg-emerald-500 dark:border-navy-500"
                      />
                      <CheckCircle2
                        size={14}
                        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 transition-opacity peer-checked:opacity-100"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        Active Facility
                      </p>
                      <p className="text-[10px] text-gray-500">Enable site operations</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Address Section */}
            <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-navy-700">
              <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
                <MapPin size={16} className="text-rose-500" />
                Location & Address
              </h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={formData.street}
                    onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 dark:border-navy-600 dark:bg-navy-900 dark:text-white outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                    placeholder="123 Industrial Area, Block C"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 dark:border-navy-600 dark:bg-navy-900 dark:text-white outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                    placeholder="City"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    State / Province
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 dark:border-navy-600 dark:bg-navy-900 dark:text-white outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                    placeholder="State"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 dark:border-navy-600 dark:bg-navy-900 dark:text-white outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                    placeholder="PIN / Zip Code"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Country
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 dark:border-navy-600 dark:bg-navy-900 dark:text-white outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                    placeholder="Country"
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-100 dark:border-navy-700 p-5 bg-gray-50 dark:bg-navy-800/80 rounded-b-2xl">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="min-w-[140px] flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : mode === 'CREATE' ? (
              'Create Plant'
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
