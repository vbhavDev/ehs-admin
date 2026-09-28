'use client';

import React, { useState } from 'react';
import { UserPlus, Mail, User, Phone, ShieldCheck, AlertCircle, Info } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import { organizationsService, InviteMemberData } from '@/services/organizations.service';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  orgId: string;
  orgName: string;
  usedSeats?: number;
  seatLimit?: number;
  onSuccess?: () => void;
}

const MEMBER_ROLES = [
  {
    id: 'org:admin',
    label: 'Organization Admin',
    description: 'Can manage organization settings, members, and site inspections.',
    badge: 'High Privileges',
  },
  {
    id: 'org:inspector',
    label: 'Safety Inspector',
    description: 'Conducts safety audits, uploads media, and submits hazard reports.',
    badge: 'Recommended',
  },
  {
    id: 'org:viewer',
    label: 'Viewer',
    description: 'Read-only access to organization metrics, reports, and dashboards.',
    badge: 'Read Only',
  },
  {
    id: 'org:owner',
    label: 'Organization Owner',
    description: 'Full ownership and top-level administrative authority over the tenant.',
    badge: 'Full Access',
  },
];

export const InviteUserModal: React.FC<InviteUserModalProps> = ({
  isOpen,
  onClose,
  orgId,
  orgName,
  usedSeats = 0,
  seatLimit = 10,
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('org:inspector');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isSeatFull = usedSeats >= seatLimit;

  const resetForm = () => {
    setEmail('');
    setFullName('');
    setPhone('');
    setRole('org:inspector');
    setErrorMessage(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Email address is required');
      return;
    }

    if (isSeatFull) {
      toast.error('Cannot invite user: Seat limit reached.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const payload: InviteMemberData = {
        email: email.trim().toLowerCase(),
        role,
        fullName: fullName.trim() || undefined,
        phone: phone.trim() || undefined,
      };

      await organizationsService.inviteMember(orgId, payload);

      toast.success(`Invitation successfully dispatched to ${email}`);
      queryClient.invalidateQueries({ queryKey: ['organizations', orgId] });
      queryClient.invalidateQueries({ queryKey: ['organizations'] });

      if (onSuccess) {
        onSuccess();
      }

      handleClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send user invitation';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg" showCloseButton={true}>
      <div className="p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4 pb-4 border-b border-gray-100 dark:border-navy-700">
          <div className="p-3 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 flex-shrink-0">
            <UserPlus size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Invite Member to Organization
              </h2>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
                {usedSeats} / {seatLimit} Seats Used
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Add users to{' '}
              <span className="font-semibold text-gray-700 dark:text-gray-200">{orgName}</span>.
              System will auto-attach existing users or onboard new users via email.
            </p>
          </div>
        </div>

        {/* Seat Limit Warning Banner */}
        {isSeatFull && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 text-sm">
            <AlertCircle
              size={18}
              className="flex-shrink-0 mt-0.5 text-rose-600 dark:text-rose-400"
            />
            <div>
              <span className="font-bold">
                Seat Limit Reached ({usedSeats}/{seatLimit})
              </span>
              <p className="text-xs mt-0.5 opacity-90">
                This organization has reached its maximum user capacity. Please update the
                organization's seat quota limit before dispatching new invitations.
              </p>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs font-medium">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* User Details Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Email Address (Required) */}
            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  required
                  placeholder="e.g. member@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-navy-600 bg-white dark:bg-navy-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                />
              </div>
            </div>

            {/* Full Name (Optional) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Full Name <span className="text-xs text-gray-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <User size={16} />
                </div>
                <input
                  type="text"
                  placeholder="e.g. Jane Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-navy-600 bg-white dark:bg-navy-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                />
              </div>
            </div>

            {/* Phone Number (Optional) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Phone Number <span className="text-xs text-gray-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Phone size={16} />
                </div>
                <input
                  type="tel"
                  placeholder="e.g. +91 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-navy-600 bg-white dark:bg-navy-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Assign Role in Organization <span className="text-rose-500">*</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {MEMBER_ROLES.map((r) => {
                const isSelected = role === r.id;
                return (
                  <div
                    key={r.id}
                    onClick={() => setRole(r.id)}
                    className={`cursor-pointer p-3.5 rounded-xl border transition-all duration-200 relative ${
                      isSelected
                        ? 'border-brand-500 bg-brand-500/5 dark:bg-brand-500/10 ring-1 ring-brand-500 shadow-sm'
                        : 'border-gray-200 dark:border-navy-700 bg-white dark:bg-navy-900 hover:border-gray-300 dark:hover:border-navy-600'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldCheck
                          size={16}
                          className={isSelected ? 'text-brand-500' : 'text-gray-400'}
                        />
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          {r.label}
                        </span>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-gray-100 dark:bg-navy-800 text-gray-600 dark:text-gray-400">
                        {r.badge}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">
                      {r.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Intelligent Dispatch Notice */}
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 text-xs text-blue-800 dark:text-blue-300">
            <Info size={16} className="flex-shrink-0 mt-0.5 text-blue-500" />
            <div>
              <span className="font-semibold">Automatic Account Matching:</span> If the email exists
              in EHS Clubhouse, an organization membership invitation will be attached. Otherwise, a
              new pending user account is registered and sent an email invite with setup
              instructions.
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-navy-700">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isSeatFull}
              className="flex items-center gap-2 text-xs"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending Invitation...
                </>
              ) : (
                <>
                  <UserPlus size={16} />
                  Send Invitation
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
