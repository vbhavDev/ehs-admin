'use client';

import React, { useState } from 'react';
import {
  MapPin,
  Search,
  Plus,
  Edit2,
  Trash2,
  Building,
  CheckCircle2,
  XCircle,
  Globe,
  Loader2,
  X,
} from 'lucide-react';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Select from '@/components/form/Select';
import Button from '@/components/ui/button/Button';
import { useLocations } from '@/modules/locations/hooks/useLocations';
import { LocationItem } from '@/services/locations.service';

export function LocationsTab() {
  const [search, setSearch] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LocationItem | null>(null);

  // Form State for Modal
  const [formData, setFormData] = useState({
    pincode: '',
    cityName: '',
    stateName: '',
    district: '',
    country: 'India',
    isActive: true,
  });

  const {
    locations,
    meta,
    states,
    isLoading,
    createLocation,
    updateLocation,
    deleteLocation,
    isCreating,
    isUpdating,
  } = useLocations({
    page,
    limit: 15,
    search: search.trim() || undefined,
    stateName: selectedState || undefined,
  });

  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setFormData({
      pincode: '',
      cityName: '',
      stateName: '',
      district: '',
      country: 'India',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: LocationItem) => {
    setEditingItem(item);
    setFormData({
      pincode: item.pincode,
      cityName: item.cityName,
      stateName: item.stateName,
      district: item.district || '',
      country: item.country || 'India',
      isActive: item.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSubmitModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.pincode || !formData.cityName || !formData.stateName) return;

    try {
      if (editingItem) {
        await updateLocation({ id: editingItem.id, data: formData });
      } else {
        await createLocation(formData);
      }
      setIsModalOpen(false);
    } catch (err) {
      // Error handled by hook toast
    }
  };

  const handleToggleActive = async (item: LocationItem) => {
    try {
      await updateLocation({ id: item.id, data: { isActive: !item.isActive } });
    } catch (err) {
      // Handled by toast
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this location entry?')) {
      try {
        await deleteLocation(id);
      } catch (err) {
        // Handled by toast
      }
    }
  };

  const stateOptions = [
    { value: '', label: 'All States / UTs' },
    ...states.map((s) => ({ value: s, label: s })),
  ];

  return (
    <div className="space-y-6">
      {/* Header & Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-navy-800 p-5 rounded-2xl border border-gray-200 dark:border-navy-700 shadow-theme-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center font-bold">
            <MapPin size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Pincodes</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {meta?.total ?? '...'}
            </h3>
          </div>
        </div>

        <div className="bg-white dark:bg-navy-800 p-5 rounded-2xl border border-gray-200 dark:border-navy-700 shadow-theme-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-success-500/10 text-success-500 flex items-center justify-center font-bold">
            <Globe size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">States Covered</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {states.length || '...'}
            </h3>
          </div>
        </div>

        <div className="bg-white dark:bg-navy-800 p-5 rounded-2xl border border-gray-200 dark:border-navy-700 shadow-theme-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold">
            <Building size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Super Admin Mode</p>
            <h3 className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
              Active Management
            </h3>
          </div>
        </div>
      </div>

      {/* Filter & Toolbar */}
      <div className="bg-white dark:bg-navy-800 p-5 rounded-2xl border border-gray-200 dark:border-navy-700 shadow-theme-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-1">
          <div className="relative flex-1 max-w-xs">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search pincode, city, state..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 dark:bg-navy-900 border border-gray-200 dark:border-navy-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="w-full sm:w-56">
            <Select
              options={stateOptions}
              value={selectedState}
              onChange={(val) => setSelectedState(val as string)}
              placeholder="Filter by State"
            />
          </div>
        </div>

        <Button
          onClick={handleOpenCreateModal}
          startIcon={<Plus size={18} />}
          className="shadow-lg shadow-brand-500/20 whitespace-nowrap w-full md:w-auto"
        >
          Add Pincode / Location
        </Button>
      </div>

      {/* Locations Table */}
      <div className="bg-white dark:bg-navy-800 rounded-2xl border border-gray-200 dark:border-navy-700 overflow-hidden shadow-theme-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
            <thead className="bg-gray-50/75 dark:bg-navy-900/50 text-xs uppercase font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-navy-700">
              <tr>
                <th className="px-6 py-4">Pincode</th>
                <th className="px-6 py-4">City / Town</th>
                <th className="px-6 py-4">District</th>
                <th className="px-6 py-4">State</th>
                <th className="px-6 py-4">Country</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-navy-700">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Loader2 size={24} className="animate-spin text-brand-500 mx-auto" />
                    <span className="text-xs text-gray-400 mt-2 block">Loading locations...</span>
                  </td>
                </tr>
              ) : locations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                    No pincode location entries found matching filters.
                  </td>
                </tr>
              ) : (
                locations.map((loc) => (
                  <tr
                    key={loc.id}
                    className="hover:bg-gray-50/50 dark:hover:bg-navy-700/50 transition-colors"
                  >
                    <td className="px-6 py-4 font-mono font-bold text-brand-600 dark:text-brand-400">
                      {loc.pincode}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      {loc.cityName}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {loc.district || '—'}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-200">
                      {loc.stateName}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">{loc.country || 'India'}</td>
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(loc)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                          loc.isActive
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20'
                        }`}
                      >
                        {loc.isActive ? (
                          <>
                            <CheckCircle2 size={12} /> Active
                          </>
                        ) : (
                          <>
                            <XCircle size={12} /> Inactive
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(loc)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-brand-500 hover:bg-brand-500/10 transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(loc.id)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-error-500 hover:bg-error-500/10 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        {meta && meta.totalPages > 1 && (
          <div className="p-4 bg-gray-50/50 dark:bg-navy-900/50 border-t border-gray-100 dark:border-navy-700 flex justify-between items-center text-xs text-gray-500">
            <span>
              Page {meta.page} of {meta.totalPages} ({meta.total} entries)
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!meta.hasPreviousPage}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!meta.hasNextPage}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-navy-800 rounded-2xl border border-gray-200 dark:border-navy-700 w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-navy-700 flex justify-between items-center">
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <MapPin size={20} className="text-brand-500" />
                {editingItem ? 'Edit Location / Pincode' : 'Add New Pincode Location'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitModal} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="modalPincode">
                    Pincode <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    id="modalPincode"
                    placeholder="e.g. 400001"
                    maxLength={6}
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="modalCity">
                    City / Town Name <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    id="modalCity"
                    placeholder="e.g. Mumbai"
                    value={formData.cityName}
                    onChange={(e) => setFormData({ ...formData, cityName: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="modalState">
                    State Name <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    id="modalState"
                    placeholder="e.g. Maharashtra"
                    value={formData.stateName}
                    onChange={(e) => setFormData({ ...formData, stateName: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="modalDistrict">District</Label>
                  <Input
                    id="modalDistrict"
                    placeholder="e.g. Mumbai City"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="modalCountry">Country</Label>
                  <Input
                    id="modalCountry"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  />
                </div>

                <div className="sm:col-span-2 pt-2 flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="modalIsActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 accent-brand-500"
                  />
                  <Label
                    htmlFor="modalIsActive"
                    className="mb-0 cursor-pointer text-sm font-medium"
                  >
                    Active Location Entry
                  </Label>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-navy-700 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  isLoading={isCreating || isUpdating}
                >
                  {editingItem ? 'Update Entry' : 'Save Location'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
