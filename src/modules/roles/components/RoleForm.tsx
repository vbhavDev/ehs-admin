'use client';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Role } from '@/types/user.types';
import InputField from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Button from '@/components/ui/button/Button';
import { PERMISSION_GROUPS, CLIENT_PERMISSION_GROUPS } from '../constants/permissions';
import { useAuthStore } from '@/store/auth.store';

interface RoleFormProps {
  initialData?: Role | null;
  onSubmit: (data: Omit<Role, 'id'>) => Promise<void>;
  isLoading: boolean;
  onCancel: () => void;
  scope?: 'SYSTEM' | 'CLIENT';
}

const RoleForm: React.FC<RoleFormProps> = ({
  initialData,
  onSubmit,
  isLoading,
  onCancel,
  scope = 'SYSTEM',
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<Omit<Role, 'id'>>({
    defaultValues: {
      name: '',
      roleKey: '',
      isActive: true,
      permissions: [],
    },
  });

  const { roleKey: currentUserRole } = useAuthStore();
  const selectedPermissions = watch('permissions') || [];
  const roleName = watch('name');

  // Filter permission groups based on user role and scope
  const filteredPermissionGroups = React.useMemo<Record<string, readonly string[]>>(() => {
    if (scope === 'CLIENT') {
      return CLIENT_PERMISSION_GROUPS;
    }

    if (currentUserRole === 'devops') return PERMISSION_GROUPS;

    // Create a copy and remove System Settings
    const { 'System Settings': _, ...others } = PERMISSION_GROUPS;
    return others;
  }, [currentUserRole, scope]);

  // Auto-generate roleKey from name
  useEffect(() => {
    if (roleName) {
      const generatedKey = roleName
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '');
      setValue('roleKey', generatedKey, { shouldDirty: true, shouldValidate: true });
    }
  }, [roleName, setValue]);

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        roleKey: initialData.roleKey,
        isActive: initialData.isActive,
        permissions: initialData.permissions,
      });
    } else {
      reset({
        name: '',
        roleKey: '',
        isActive: true,
        permissions: [],
      });
    }
  }, [initialData, reset]);

  const togglePermission = (permission: string) => {
    const isSelecting = !selectedPermissions.includes(permission);
    let newPermissions: string[];

    if (isSelecting) {
      newPermissions = [...selectedPermissions, permission];
      // Dependency: If selecting any action (e.g., .create), ensure .view is also selected
      if (!permission.endsWith('.view')) {
        const prefix = permission.split('.')[0];
        // Find if there's a corresponding .view permission in any group
        const viewPermission = Object.values(filteredPermissionGroups)
          .flat()
          .find((p) => p === `${prefix}.view`);

        if (viewPermission && !newPermissions.includes(viewPermission)) {
          newPermissions.push(viewPermission);
        }
      }
    } else {
      newPermissions = selectedPermissions.filter((p) => p !== permission);
      // Dependency: If deselecting a .view permission, deselect all related actions (e.g., .create, .update)
      if (permission.endsWith('.view')) {
        const prefix = permission.split('.')[0];
        newPermissions = newPermissions.filter((p) => !p.startsWith(`${prefix}.`));
      }
    }

    setValue('permissions', newPermissions, { shouldDirty: true, shouldValidate: true });
  };

  const toggleGroup = (groupPermissions: readonly string[]) => {
    const allSelected = groupPermissions.every((p) => selectedPermissions.includes(p));
    let newPermissions: string[];

    if (allSelected) {
      newPermissions = selectedPermissions.filter((p) => !groupPermissions.includes(p));
    } else {
      const uniqueNew = groupPermissions.filter((p) => !selectedPermissions.includes(p));
      newPermissions = [...selectedPermissions, ...uniqueNew];

      // Ensure that if any action was added, its corresponding .view is also added
      // (even if it wasn't in the same group, though usually it is)
      uniqueNew.forEach((perm) => {
        if (!perm.endsWith('.view')) {
          const prefix = perm.split('.')[0];
          const viewPermission = Object.values(filteredPermissionGroups)
            .flat()
            .find((p) => p === `${prefix}.view`);

          if (viewPermission && !newPermissions.includes(viewPermission)) {
            newPermissions.push(viewPermission);
          }
        }
      });
    }

    setValue('permissions', newPermissions, { shouldDirty: true, shouldValidate: true });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-7xl mx-auto">
      {/* Role Basic Info Card - Modernized */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-500 to-purple-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
        <div className="relative bg-white dark:bg-navy-900 border border-gray-200/50 dark:border-navy-800/50 rounded-3xl p-8 sm:p-10 shadow-xl shadow-brand-900/5 dark:shadow-black/20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-700 dark:text-navy-100 font-bold ml-1">
                Role Name
              </Label>
              <InputField
                id="name"
                placeholder="e.g. Senior Manager"
                {...register('name', { required: 'Role name is required' })}
                error={!!errors.name}
                hint={errors.name?.message}
                className="bg-gray-50/50 dark:bg-navy-950/50 border-gray-200 dark:border-navy-800 focus:bg-white focus:ring-2 focus:ring-brand-500/20 text-lg py-3 rounded-xl transition-all duration-300"
              />
              <input type="hidden" {...register('roleKey')} />
              {roleName && (
                <div className="mt-2 ml-1 flex items-center gap-2">
                  <span className="text-xs text-gray-400 font-medium">Generated Key:</span>
                  <span className="text-xs font-mono bg-gray-100 dark:bg-navy-800 text-brand-600 dark:text-brand-400 px-2 py-0.5 rounded-md">
                    {watch('roleKey')}
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col justify-start pt-1 md:pt-8">
              <label className="flex items-center gap-4 cursor-pointer p-4 rounded-2xl border border-gray-100 dark:border-navy-800 bg-gray-50/50 dark:bg-navy-950/50 hover:bg-white dark:hover:bg-navy-900 transition-all duration-300 group/toggle hover:shadow-md hover:border-brand-200 dark:hover:border-brand-500/30">
                <div className="relative">
                  <input
                    type="checkbox"
                    id="isActive"
                    {...register('isActive')}
                    className="peer sr-only"
                  />
                  <div className="block h-8 w-14 rounded-full bg-gray-200 dark:bg-navy-700 transition-colors duration-300 peer-checked:bg-brand-500 peer-focus:ring-4 peer-focus:ring-brand-500/20"></div>
                  <div className="absolute left-1 top-1 h-6 w-6 rounded-full bg-white transition-transform duration-300 peer-checked:translate-x-6 shadow-sm flex items-center justify-center">
                    <div
                      className={`w-2 h-2 rounded-full transition-colors duration-300 ${watch('isActive') ? 'bg-brand-500' : 'bg-gray-300'}`}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="text-base font-bold text-gray-900 dark:text-white group-hover/toggle:text-brand-600 dark:group-hover/toggle:text-brand-400 transition-colors">
                    Active Status
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                    {watch('isActive')
                      ? 'Role is currently active and assignable'
                      : 'Role is disabled and hidden from assignment'}
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Permissions Groups - Modernized */}
      <div className="space-y-6 pt-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">Role Permissions</h3>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Configure access levels for each module
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Object.entries(filteredPermissionGroups).map(([group, permissions]) => {
            const allSelected = permissions.every((p) => selectedPermissions.includes(p));
            const selectedCount = permissions.filter((p) => selectedPermissions.includes(p)).length;
            const progress = (selectedCount / permissions.length) * 100;

            return (
              <div
                key={group}
                className="group/card relative bg-white dark:bg-navy-900 border border-gray-200/60 dark:border-navy-800/60 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1"
              >
                {/* Progress Bar Indicator */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gray-100 dark:bg-navy-800">
                  <div
                    className="h-full bg-gradient-to-r from-brand-500 to-purple-500 transition-all duration-700 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="bg-gray-50/80 dark:bg-navy-950/80 backdrop-blur-sm px-6 py-5 border-b border-gray-100 dark:border-navy-800 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white dark:bg-navy-900 shadow-sm border border-gray-100 dark:border-navy-800 text-brand-600">
                      <span className="font-extrabold text-sm">
                        {selectedCount}/{permissions.length}
                      </span>
                    </div>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">{group}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleGroup(permissions)}
                    className={`relative overflow-hidden group/btn text-xs font-bold px-4 py-2 rounded-xl transition-all duration-300 ${
                      allSelected
                        ? 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 hover:bg-brand-100 dark:hover:bg-brand-500/20'
                        : 'bg-white text-gray-600 border border-gray-200 shadow-sm hover:border-brand-300 hover:text-brand-600 dark:bg-navy-800 dark:border-navy-700 dark:text-gray-300 dark:hover:border-brand-500/50 dark:hover:text-brand-400'
                    }`}
                  >
                    <span className="relative z-10">
                      {allSelected ? 'Deselect All' : 'Select All'}
                    </span>
                  </button>
                </div>

                <div className="p-6 flex flex-col gap-8">
                  {Object.entries(
                    permissions.reduce(
                      (acc, perm) => {
                        const prefix = perm.split('.')[0] || 'general';
                        if (!acc[prefix]) acc[prefix] = [];
                        acc[prefix].push(perm);
                        return acc;
                      },
                      {} as Record<string, string[]>,
                    ),
                  ).map(([prefix, subPermissions]) => (
                    <div key={prefix} className="space-y-4">
                      <div className="flex items-center gap-4">
                        <h4 className="text-[13px] font-bold uppercase tracking-widest text-gray-400 dark:text-navy-400">
                          {prefix.replace('-', ' ')}
                        </h4>
                        <div className="h-px grow bg-gradient-to-r from-gray-200 to-transparent dark:from-navy-700 dark:to-transparent" />
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {subPermissions.map((perm) => {
                          const isView = perm.endsWith('.view');
                          const viewPerm = subPermissions.find((p) => p === `${prefix}.view`);
                          const isViewSelected = viewPerm
                            ? selectedPermissions.includes(viewPerm)
                            : true;
                          const isSelected = selectedPermissions.includes(perm);
                          const isDisabled = !isView && !isViewSelected;

                          return (
                            <button
                              key={perm}
                              type="button"
                              disabled={isDisabled}
                              onClick={() => togglePermission(perm)}
                              className={`group/perm flex items-center gap-2.5 px-4 py-2.5 rounded-xl border-2 transition-all duration-300 select-none ${
                                isDisabled
                                  ? 'opacity-40 cursor-not-allowed bg-gray-50 border-gray-100 text-gray-400 dark:bg-navy-950/50 dark:border-navy-900 dark:text-navy-600'
                                  : isSelected
                                    ? 'bg-brand-50 text-brand-700 border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-300 dark:border-brand-500/40 shadow-[0_4px_12px_rgba(79,70,229,0.1)]'
                                    : 'bg-white text-gray-600 border-gray-100 hover:border-brand-200 hover:bg-gray-50 hover:shadow-sm dark:bg-navy-900 dark:text-navy-300 dark:border-navy-800 dark:hover:border-brand-500/30 dark:hover:bg-navy-800/80'
                              }`}
                            >
                              <div
                                className={`flex items-center justify-center w-5 h-5 rounded-md border transition-all duration-300 ${
                                  isSelected
                                    ? 'bg-brand-500 border-brand-500 shadow-[0_0_10px_rgba(79,70,229,0.4)]'
                                    : 'bg-white border-gray-300 dark:bg-navy-800 dark:border-navy-600 group-hover/perm:border-brand-400'
                                }`}
                              >
                                {isSelected && (
                                  <svg
                                    className="w-3.5 h-3.5 text-white"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={3}
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                )}
                              </div>
                              <span className="text-sm font-bold capitalize tracking-wide">
                                {perm.split('.').slice(1).join(' ').replace('_', ' ') ||
                                  perm.split('.').join(' ').replace('_', ' ')}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="sticky bottom-6 z-20 flex justify-end gap-4 bg-white/80 dark:bg-navy-900/80 backdrop-blur-xl p-4 rounded-2xl border border-gray-200/50 dark:border-navy-800/50 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.2)] mt-10">
        <Button
          variant="outline"
          onClick={onCancel}
          type="button"
          className="px-6 py-2.5 font-bold rounded-xl border-gray-200 hover:bg-gray-50 dark:border-navy-700 dark:hover:bg-navy-800"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          isLoading={isLoading}
          disabled={isLoading}
          className="px-8 py-2.5 font-bold rounded-xl shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 hover:-translate-y-0.5 transition-all"
        >
          {initialData ? 'Save Changes' : 'Create Role'}
        </Button>
      </div>
    </form>
  );
};

export default RoleForm;
