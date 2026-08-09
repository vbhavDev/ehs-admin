'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  FileText,
  MapPin,
  Save,
  Loader2,
  Sparkles,
  UserCheck,
  Layers,
  ImagePlus,
  Trash2,
} from 'lucide-react';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Select from '@/components/form/Select';
import Button from '@/components/ui/button/Button';
import { FileUploadModal } from '@/modules/media/components/FileUploadModal';
import {
  Organization,
  ORGANIZATION_STATUSES,
  ORGANIZATION_STATUS_LABELS,
} from '@/types/organization.types';
import { useOrganizations } from '../hooks/useOrganizations';
import { locationsService } from '@/services/locations.service';
import { getImageUrl, cn } from '@/lib/utils';

// Helper to safely extract full image preview URL from logoFileId (string | populated object)
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const resolveLogoUrl = (logoFile: any): string => {
  if (!logoFile) return '';
  if (typeof logoFile === 'string') {
    return logoFile.startsWith('http') || logoFile.startsWith('/')
      ? logoFile
      : getImageUrl(logoFile);
  }
  if (typeof logoFile === 'object') {
    if (logoFile.url) return logoFile.url;
    if (logoFile.id) return getImageUrl(logoFile.id);
  }
  return getImageUrl(logoFile);
};

// Step 1 schema - Organization & Primary Contact details
const step1Schema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  slug: z.string().min(2, 'Slug is required'),
  domain: z.string().optional(),
  logoFileId: z.string().optional(),
  contactPersonName: z.string().optional(),
  contactPersonEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  contactPersonPhone: z.string().optional(),
  employeeCount: z.coerce.number().min(0).optional(),
  siteCount: z.coerce.number().min(0).optional(),
  seatLimit: z.coerce.number().min(1, 'Seat limit must be at least 1').optional(),
  status: z.string().optional(),
  isActive: z.boolean(),
});

// Full schema including Step 2 (Tax & Address)
const fullOrgSchema = step1Schema.extend({
  gstin: z.string().optional(),
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
});

type OrgFormData = z.infer<typeof fullOrgSchema>;

interface OrganizationFormProps {
  initialData?: Organization | null;
}

const generateSlug = (name: string) =>
  name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const STEPS = [
  {
    id: 1,
    title: 'Organization & Contact',
    subtitle: 'Company profile, logo & owner info',
    icon: Building2,
  },
  {
    id: 2,
    title: 'Tax & Registered Address',
    subtitle: 'GSTIN & automated Indian pincode geocoding',
    icon: MapPin,
  },
];

export const OrganizationForm: React.FC<OrganizationFormProps> = ({ initialData }) => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [activeOrgId, setActiveOrgId] = useState<string | null>(initialData?.id || null);
  const isEdit = !!initialData || !!activeOrgId;

  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string>(() =>
    resolveLogoUrl(initialData?.logoFileId),
  );

  const { createOrganization, updateOrganization, isCreating, isUpdating } = useOrganizations();

  const {
    register,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<OrgFormData>({
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    resolver: zodResolver(fullOrgSchema) as any,
    defaultValues: initialData
      ? {
          companyName: initialData.companyName,
          slug: initialData.slug,
          domain: initialData.domain || '',
          logoFileId:
            typeof initialData.logoFileId === 'object'
              ? initialData.logoFileId?.id || ''
              : initialData.logoFileId || '',
          contactPersonName: initialData.contactPersonName || '',
          contactPersonEmail: initialData.contactPersonEmail || '',
          contactPersonPhone: initialData.contactPersonPhone || '',
          gstin: initialData.gstin || '',
          employeeCount: initialData.employeeCount || 0,
          siteCount: initialData.siteCount || 0,
          seatLimit: initialData.seatLimit ?? 10,
          status: initialData.status,
          isActive: initialData.isActive,
          street: initialData.address?.street || '',
          city: initialData.address?.city || '',
          state: initialData.address?.state || '',
          country: initialData.address?.country || '',
          postalCode: initialData.address?.postalCode || '',
        }
      : {
          companyName: '',
          slug: '',
          domain: '',
          logoFileId: '',
          contactPersonName: '',
          contactPersonEmail: '',
          contactPersonPhone: '',
          gstin: '',
          employeeCount: 0,
          siteCount: 0,
          seatLimit: 10,
          status: 'pending_setup',
          isActive: true,
          street: '',
          city: '',
          state: '',
          country: 'India',
          postalCode: '',
        },
  });

  // Sync logo preview and form state when initialData loads asynchronously
  useEffect(() => {
    if (initialData) {
      if (initialData.logoFileId) {
        setLogoPreviewUrl(resolveLogoUrl(initialData.logoFileId));
      }
      if (initialData.id) {
        setActiveOrgId(initialData.id);
      }
    }
  }, [initialData]);

  const watchCompanyName = watch('companyName');
  const watchSlug = watch('slug');

  const handleCompanyNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setValue('companyName', name);
    if (!isEdit) {
      setValue('slug', generateSlug(name));
    }
  };

  const [isPincodeLoading, setIsPincodeLoading] = useState(false);
  const [geocodedMessage, setGeocodedMessage] = useState<string | null>(null);

  const handlePostalCodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue('postalCode', val);
    setGeocodedMessage(null);

    if (val && val.length === 6) {
      setIsPincodeLoading(true);
      try {
        const locs = await locationsService.getLocationByPincode(val);
        if (locs && locs.length > 0) {
          const primary = locs[0];
          if (primary?.cityName) setValue('city', primary.cityName);
          if (primary?.stateName) setValue('state', primary.stateName);
          if (primary?.country) setValue('country', primary.country);
          if (primary?.cityName && primary?.stateName) {
            setGeocodedMessage(`${primary.cityName}, ${primary.stateName}`);
          }
        }
      } catch (err) {
        // Silently handle pincode auto-fill lookup
      } finally {
        setIsPincodeLoading(false);
      }
    }
  };

  const handleRemoveLogo = () => {
    setValue('logoFileId', '');
    setLogoPreviewUrl('');
  };

  /** Step 1 handler: Save Organization Details & move to Step 2 or Dashboard */
  const handleSaveStep1 = async (shouldNavigateToDashboard = false) => {
    const isStep1Valid = await trigger(['companyName', 'slug', 'domain', 'contactPersonEmail']);

    if (!isStep1Valid) return null;

    const values = watch();

    const step1Payload: Record<string, unknown> = {
      companyName: values.companyName,
      slug: values.slug,
      domain: values.domain || undefined,
      logoFileId: values.logoFileId || undefined,
      contactPersonName: values.contactPersonName || undefined,
      contactPersonEmail: values.contactPersonEmail || undefined,
      contactPersonPhone: values.contactPersonPhone || undefined,
      employeeCount:
        values.employeeCount !== undefined &&
        values.employeeCount !== null &&
        (values.employeeCount as unknown) !== ''
          ? Number(values.employeeCount)
          : 0,
      siteCount:
        values.siteCount !== undefined &&
        values.siteCount !== null &&
        (values.siteCount as unknown) !== ''
          ? Number(values.siteCount)
          : 0,
      seatLimit:
        values.seatLimit !== undefined &&
        values.seatLimit !== null &&
        (values.seatLimit as unknown) !== ''
          ? Number(values.seatLimit)
          : 10,
      status: values.status,
      isActive: values.isActive,
    };

    try {
      let targetId = activeOrgId;
      if (activeOrgId) {
        // Update existing org - slug is immutable after creation
        const { slug: _slug, ...updatePayload } = step1Payload;
        await updateOrganization({ id: activeOrgId, data: updatePayload });
      } else {
        // Create new org & store its ID
        const createdOrg = await createOrganization(step1Payload as never);
        if (createdOrg?.id) {
          targetId = createdOrg.id;
          setActiveOrgId(createdOrg.id);
        }
      }

      if (shouldNavigateToDashboard && targetId) {
        router.push(`/organizations/${targetId}`);
        return targetId;
      }

      setCurrentStep(2);
      return targetId;
    } catch (error) {
      // Toast handles error display
      return null;
    }
  };

  /** Step 2 handler: Final save for Registered Address & GSTIN */
  const handleSaveStep2 = async () => {
    let orgIdToUpdate = activeOrgId;
    if (!orgIdToUpdate) {
      // Fallback if user clicked Step 2 directly before saving Step 1
      orgIdToUpdate = await handleSaveStep1();
      if (!orgIdToUpdate) return;
    }

    const values = watch();
    const step2Payload: Record<string, unknown> = {
      gstin: values.gstin || undefined,
      address: {
        street: values.street || '',
        city: values.city || '',
        state: values.state || '',
        country: values.country || '',
        postalCode: values.postalCode || '',
      },
    };

    try {
      await updateOrganization({ id: orgIdToUpdate, data: step2Payload });
      router.push(`/organizations/${orgIdToUpdate}`);
    } catch (error) {
      // Toast handles error display
    }
  };

  const statusOptions = ORGANIZATION_STATUSES.map((s) => ({
    value: s,
    label: ORGANIZATION_STATUS_LABELS[s] || s,
  }));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header Card */}
      <div className="relative overflow-hidden bg-gradient-to-r from-brand-600 via-brand-500 to-indigo-600 dark:from-navy-800 dark:via-navy-700 dark:to-brand-900/60 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-brand-500/10">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold tracking-wide uppercase mb-3 border border-white/20">
              <Sparkles size={13} className="text-amber-300" />
              {isEdit ? 'Organization Management' : 'New Organization Onboarding'}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {isEdit ? initialData?.companyName || 'Edit Organization' : 'Create New Organization'}
            </h1>
            <p className="text-sm text-white/80 mt-1 max-w-xl">
              Configure company credentials, upload logo asset, setup organization ownership, and
              register compliance details.
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push('/organizations')}
            className="self-start sm:self-center inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-sm font-medium transition-all duration-200 border border-white/15 hover:border-white/30"
          >
            <ArrowLeft size={16} />
            Back to List
          </button>
        </div>

        {/* Decorative background blur shapes */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -left-10 -top-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Multi-Step Interactive Stepper */}
      <div className="bg-white dark:bg-navy-800 rounded-2xl border border-gray-200/80 dark:border-navy-700/80 p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative">
          {STEPS.map((step, idx) => {
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            const Icon = step.icon;

            return (
              <React.Fragment key={step.id}>
                <button
                  type="button"
                  onClick={() => {
                    if (isEdit || isCompleted) setCurrentStep(step.id);
                  }}
                  disabled={!isEdit && !isCompleted && !isCurrent}
                  className={cn(
                    'flex items-center gap-4 text-left transition-all duration-200 rounded-xl p-3.5 flex-1 group relative',
                    isCurrent &&
                      'bg-brand-50/80 dark:bg-brand-500/10 border border-brand-500/30 dark:border-brand-500/20 shadow-sm',
                    isCompleted && 'hover:bg-gray-50 dark:hover:bg-navy-700/60 cursor-pointer',
                    !isEdit && !isCompleted && !isCurrent && 'opacity-60 cursor-not-allowed',
                  )}
                >
                  <div
                    className={cn(
                      'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl font-bold transition-all duration-300',
                      isCompleted &&
                        'bg-emerald-500 text-white shadow-md shadow-emerald-500/20 scale-100',
                      isCurrent &&
                        'bg-brand-500 text-white shadow-lg shadow-brand-500/30 scale-105 ring-4 ring-brand-500/20',
                      !isCompleted &&
                        !isCurrent &&
                        'bg-gray-100 dark:bg-navy-700 text-gray-400 dark:text-gray-500',
                    )}
                  >
                    {isCompleted ? <Check size={20} className="stroke-[3]" /> : <Icon size={20} />}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md',
                          isCurrent && 'bg-brand-500 text-white',
                          isCompleted &&
                            'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
                          !isCompleted &&
                            !isCurrent &&
                            'bg-gray-100 dark:bg-navy-700 text-gray-500',
                        )}
                      >
                        Step 0{step.id}
                      </span>
                      {isCompleted && (
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                          Saved
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white mt-1 group-hover:text-brand-500 transition-colors">
                      {step.title}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {step.subtitle}
                    </p>
                  </div>
                </button>

                {idx < STEPS.length - 1 && (
                  <div className="hidden md:block w-12 h-[2px] bg-gradient-to-r from-gray-200 to-gray-300 dark:from-navy-700 dark:to-navy-600 shrink-0 self-center" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Main Form Container */}
      <div className="bg-white dark:bg-navy-800 rounded-2xl border border-gray-200/80 dark:border-navy-700/80 overflow-hidden shadow-xl shadow-gray-100/50 dark:shadow-none">
        {/* STEP 1: ORGANIZATION & CONTACT DETAILS */}
        {currentStep === 1 && (
          <div className="p-6 sm:p-8 space-y-8 animate-fadeIn">
            {/* Company Information */}
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-navy-700 pb-4">
                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-brand-50 dark:bg-brand-500/10 text-brand-500">
                    <Building2 size={20} />
                  </div>
                  Company Profile & Branding
                </h3>
                <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                  Required fields marked with <span className="text-rose-500">*</span>
                </span>
              </div>

              {/* Organization Logo Upload Card */}
              <div className="p-5 rounded-2xl border border-gray-200/80 dark:border-navy-700 bg-gray-50/50 dark:bg-navy-900/30 flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-2 border-dashed border-gray-300 dark:border-navy-600 bg-white dark:bg-navy-800 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                  {logoPreviewUrl ? (
                    <img
                      src={logoPreviewUrl}
                      alt="Organization Logo"
                      className="w-full h-full object-contain p-2"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-gray-400 dark:text-gray-500">
                      <ImagePlus size={28} />
                      <span className="text-[10px] font-medium">No Logo</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2 flex-1">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                      Organization Brand Logo
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Upload transparent PNG, SVG, or JPG image to display across multi-tenant
                      client portals & reports.
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsLogoModalOpen(true)}
                      startIcon={<ImagePlus size={15} />}
                      className="px-4 py-2 text-xs font-semibold"
                    >
                      {logoPreviewUrl ? 'Change Logo' : 'Upload Logo'}
                    </Button>

                    {logoPreviewUrl && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveLogo}
                        startIcon={<Trash2 size={15} className="text-rose-500" />}
                        className="px-3 py-2 text-xs text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 font-medium"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="companyName"
                    className="font-medium text-gray-700 dark:text-gray-300"
                  >
                    Company Name <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="companyName"
                    placeholder="e.g. Acme Safety Systems Pvt Ltd"
                    value={watchCompanyName}
                    onChange={handleCompanyNameChange}
                    error={!!errors.companyName}
                    hint={errors.companyName?.message}
                    className="focus:ring-brand-500/20"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="slug" className="font-medium text-gray-700 dark:text-gray-300">
                      Organization Slug <span className="text-rose-500">*</span>
                    </Label>
                    {watchSlug && (
                      <span className="text-[11px] font-mono bg-gray-100 dark:bg-navy-700 px-2 py-0.5 rounded text-brand-600 dark:text-brand-400">
                        /{watchSlug}
                      </span>
                    )}
                  </div>
                  <Input
                    id="slug"
                    placeholder="e.g. acme-safety-systems"
                    {...register('slug')}
                    error={!!errors.slug}
                    hint={errors.slug?.message || 'Unique URL identifier for the organization'}
                    disabled={isEdit && !!initialData}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="domain" className="font-medium text-gray-700 dark:text-gray-300">
                    Domain / Website URL
                  </Label>
                  <Input
                    id="domain"
                    placeholder="e.g. acme.com"
                    {...register('domain')}
                    error={!!errors.domain}
                    hint={errors.domain?.message}
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="seatLimit"
                    className="font-medium text-gray-700 dark:text-gray-300"
                  >
                    User Seat Quota (Max Seats)
                  </Label>
                  <Input
                    id="seatLimit"
                    type="number"
                    min={1}
                    placeholder="e.g. 10"
                    {...register('seatLimit')}
                    error={!!errors.seatLimit}
                    hint={errors.seatLimit?.message || 'Maximum user accounts permitted'}
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="employeeCount"
                    className="font-medium text-gray-700 dark:text-gray-300"
                  >
                    Total Employee Count
                  </Label>
                  <Input
                    id="employeeCount"
                    type="number"
                    min={0}
                    placeholder="e.g. 250"
                    {...register('employeeCount')}
                    error={!!errors.employeeCount}
                    hint={errors.employeeCount?.message}
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="siteCount"
                    className="font-medium text-gray-700 dark:text-gray-300"
                  >
                    Site / Plant / Facility Count
                  </Label>
                  <Input
                    id="siteCount"
                    type="number"
                    min={0}
                    placeholder="e.g. 5"
                    {...register('siteCount')}
                    error={!!errors.siteCount}
                    hint={errors.siteCount?.message}
                  />
                </div>
              </div>
            </div>

            {/* Primary Contact */}
            <div className="space-y-5 pt-4 border-t border-gray-100 dark:border-navy-700">
              <div className="flex items-center justify-between pb-2">
                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500">
                    <UserCheck size={20} />
                  </div>
                  Primary Contact Person & Owner
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="contactPersonName"
                    className="font-medium text-gray-700 dark:text-gray-300"
                  >
                    Contact Name
                  </Label>
                  <Input
                    id="contactPersonName"
                    placeholder="e.g. Rahul Sharma"
                    {...register('contactPersonName')}
                    error={!!errors.contactPersonName}
                    hint={errors.contactPersonName?.message}
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="contactPersonEmail"
                    className="font-medium text-gray-700 dark:text-gray-300"
                  >
                    Contact Email Address
                  </Label>
                  <Input
                    id="contactPersonEmail"
                    type="email"
                    placeholder="e.g. rahul@acme.com"
                    {...register('contactPersonEmail')}
                    error={!!errors.contactPersonEmail}
                    hint={errors.contactPersonEmail?.message}
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="contactPersonPhone"
                    className="font-medium text-gray-700 dark:text-gray-300"
                  >
                    Contact Phone Number
                  </Label>
                  <Input
                    id="contactPersonPhone"
                    placeholder="e.g. +919876543210"
                    {...register('contactPersonPhone')}
                    error={!!errors.contactPersonPhone}
                    hint={errors.contactPersonPhone?.message}
                  />
                </div>
              </div>
            </div>

            {/* Status & Activation Settings */}
            <div className="space-y-5 pt-4 border-t border-gray-100 dark:border-navy-700">
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500">
                  <Layers size={20} />
                </div>
                Organization Status & Activation
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-gray-50/60 dark:bg-navy-900/40 p-5 rounded-2xl border border-gray-200/60 dark:border-navy-700/60">
                {isEdit && (
                  <div className="space-y-2">
                    <Label
                      htmlFor="status"
                      className="font-medium text-gray-700 dark:text-gray-300"
                    >
                      Organization Lifecycle Status
                    </Label>
                    <Select
                      options={statusOptions}
                      value={watch('status')}
                      onChange={(value) => setValue('status', value as string)}
                      placeholder="Select Status"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between p-3.5 bg-white dark:bg-navy-800 rounded-xl border border-gray-200 dark:border-navy-700">
                  <div>
                    <Label
                      htmlFor="isActive"
                      className="mb-0 cursor-pointer font-bold text-gray-900 dark:text-white text-sm"
                    >
                      Active Status
                    </Label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Enable organization login & platform access
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    id="isActive"
                    {...register('isActive')}
                    className="w-5 h-5 rounded border-gray-300 accent-brand-500 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-700 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Step 1 Footer Actions */}
            <div className="pt-6 border-t border-gray-100 dark:border-navy-700 flex flex-wrap items-center justify-between gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  router.push(activeOrgId ? `/organizations/${activeOrgId}` : '/organizations')
                }
                className="px-6 py-2.5 font-semibold"
              >
                Cancel
              </Button>
              <div className="flex items-center gap-3">
                {isEdit && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleSaveStep1(true)}
                    disabled={isCreating || isUpdating}
                    isLoading={isCreating || isUpdating}
                    startIcon={<Save size={16} />}
                    className="px-5 py-2.5 font-semibold text-gray-700 dark:text-gray-200"
                  >
                    Save & View Dashboard
                  </Button>
                )}
                <Button
                  type="button"
                  onClick={() => handleSaveStep1(false)}
                  disabled={isCreating || isUpdating}
                  isLoading={isCreating || isUpdating}
                  endIcon={<ArrowRight size={18} />}
                  className="px-8 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold shadow-lg shadow-brand-500/25 rounded-xl transition-all duration-200 hover:scale-[1.01]"
                >
                  Save & Continue to Tax / Address
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: TAX & REGISTERED ADDRESS */}
        {currentStep === 2 && (
          <div className="p-6 sm:p-8 space-y-8 animate-fadeIn">
            {/* Tax & Compliance Information */}
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-navy-700 pb-4">
                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-500">
                    <FileText size={20} />
                  </div>
                  Tax & Compliance Identification
                </h3>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-xs font-semibold border border-amber-200 dark:border-amber-800/40">
                  GSTIN / PAN Validation
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="gstin" className="font-medium text-gray-700 dark:text-gray-300">
                    GSTIN / Tax Identification Number
                  </Label>
                  <Input
                    id="gstin"
                    placeholder="e.g. 27AABCA1234L1Z5"
                    {...register('gstin')}
                    error={!!errors.gstin}
                    hint={
                      errors.gstin?.message ||
                      '15-digit Goods and Services Tax Identification Number'
                    }
                    className="font-mono text-sm tracking-wider uppercase"
                  />
                </div>
              </div>
            </div>

            {/* Registered Address */}
            <div className="space-y-5 pt-4 border-t border-gray-100 dark:border-navy-700">
              <div className="flex items-center justify-between pb-2">
                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-500">
                    <MapPin size={20} />
                  </div>
                  Registered Headquarters Address
                </h3>
                {geocodedMessage && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-semibold border border-emerald-200 dark:border-emerald-800/40 animate-fadeIn">
                    <Sparkles size={13} />
                    Auto-Geocoded: {geocodedMessage}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="street" className="font-medium text-gray-700 dark:text-gray-300">
                    Street Address / Premises
                  </Label>
                  <Input
                    id="street"
                    placeholder="e.g. Building No. 4, MIDC Industrial Area"
                    {...register('street')}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="postalCode"
                      className="font-medium text-gray-700 dark:text-gray-300"
                    >
                      Postal Code / Pincode
                    </Label>
                    {isPincodeLoading && (
                      <span className="text-xs text-brand-500 font-semibold flex items-center gap-1.5 animate-pulse">
                        <Loader2 size={13} className="animate-spin" /> Geocoding...
                      </span>
                    )}
                  </div>
                  <Input
                    id="postalCode"
                    placeholder="e.g. 400001"
                    maxLength={6}
                    value={watch('postalCode')}
                    onChange={handlePostalCodeChange}
                    hint="Enter 6-digit Indian postal code to auto-resolve city & state"
                    className="font-mono text-sm tracking-wider"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city" className="font-medium text-gray-700 dark:text-gray-300">
                    City
                  </Label>
                  <Input id="city" placeholder="e.g. Mumbai" {...register('city')} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state" className="font-medium text-gray-700 dark:text-gray-300">
                    State / Union Territory
                  </Label>
                  <Input id="state" placeholder="e.g. Maharashtra" {...register('state')} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country" className="font-medium text-gray-700 dark:text-gray-300">
                    Country
                  </Label>
                  <Input id="country" placeholder="e.g. India" {...register('country')} />
                </div>
              </div>
            </div>

            {/* Step 2 Footer Actions */}
            <div className="pt-6 border-t border-gray-100 dark:border-navy-700 flex items-center justify-between gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(1)}
                startIcon={<ArrowLeft size={18} />}
                className="px-6 py-2.5 font-semibold"
              >
                Back to Org Details
              </Button>
              <Button
                type="button"
                onClick={handleSaveStep2}
                disabled={isUpdating}
                isLoading={isUpdating}
                startIcon={<Save size={18} />}
                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-600/25 rounded-xl transition-all duration-200 hover:scale-[1.01]"
              >
                Save Registered Address & Complete
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* System Default File Upload Modal for Organization Logo */}
      <FileUploadModal
        isOpen={isLogoModalOpen}
        onClose={() => setIsLogoModalOpen(false)}
        onUploaded={(uploadedFile) => {
          setValue('logoFileId', uploadedFile.id);
          const resolvedUrl = uploadedFile.url || getImageUrl(uploadedFile as never);
          setLogoPreviewUrl(resolvedUrl);
        }}
        defaultModule="organizations"
        entityType="organization"
        entityId={activeOrgId ?? 'new'}
        accept="image/*"
      />
    </div>
  );
};
