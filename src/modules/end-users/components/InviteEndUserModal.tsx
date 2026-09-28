'use client';
import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Select from '@/components/form/Select';
import Button from '@/components/ui/button/Button';
import { MailPlus, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useOrganizations } from '@/modules/organizations/hooks/useOrganizations';
import { useInviteEndUser } from '../hooks/useInviteEndUser';
import { END_USER_ROLE_LABELS } from '@/types/end-user.types';

interface InviteEndUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ROLE_OPTIONS = ['org:owner', 'org:admin', 'org:inspector', 'org:viewer'].map((r) => ({
  value: r,
  label: END_USER_ROLE_LABELS[r] || r,
}));

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const InviteEndUserModal: React.FC<InviteEndUserModalProps> = ({ isOpen, onClose }) => {
  const { organizations, isLoading: isLoadingOrgs } = useOrganizations({ page: 1, limit: 100 });
  const { inviteEndUser, isInviting } = useInviteEndUser();

  const [orgId, setOrgId] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('org:viewer');
  const [errors, setErrors] = useState<{ orgId?: string; email?: string }>({});

  const orgOptions = organizations.map((o) => ({ value: o.id, label: o.companyName }));

  const reset = () => {
    setOrgId('');
    setEmail('');
    setFullName('');
    setRole('org:viewer');
    setErrors({});
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: { orgId?: string; email?: string } = {};
    if (!orgId) nextErrors.orgId = 'Please select an organization';
    if (!email.trim()) nextErrors.email = 'Email is required';
    else if (!EMAIL_RE.test(email.trim())) nextErrors.email = 'Enter a valid email address';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      await inviteEndUser({
        orgId,
        data: {
          email: email.trim(),
          role,
          ...(fullName.trim() ? { fullName: fullName.trim() } : {}),
        },
      });
      toast.success(`Invitation sent to ${email.trim()}`);
      handleClose();
    } catch {
      // Error toast handled by the mutation
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md" title="Invite End User">
      <form onSubmit={handleSubmit} className="space-y-5 p-1">
        <div className="flex items-start gap-3 rounded-xl border border-brand-200 bg-brand-50/60 p-4 dark:border-brand-500/30 dark:bg-brand-500/10">
          <MailPlus size={18} className="mt-0.5 shrink-0 text-brand-500" />
          <p className="text-xs text-gray-600 dark:text-gray-300">
            The user receives an email with a secure link to join the selected organization and set
            up their account.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="invite-org">
            Organization <span className="text-error-500">*</span>
          </Label>
          <div className="relative">
            <Select
              id="invite-org"
              options={orgOptions}
              value={orgId}
              onChange={(value) => setOrgId(value)}
              placeholder={isLoadingOrgs ? 'Loading organizations…' : 'Select organization'}
              disabled={isLoadingOrgs}
            />
            <Building2
              size={15}
              className="pointer-events-none absolute right-9 top-1/2 -translate-y-1/2 text-gray-400"
            />
          </div>
          {errors.orgId && <p className="text-xs text-error-500">{errors.orgId}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="invite-email">
            Email address <span className="text-error-500">*</span>
          </Label>
          <Input
            id="invite-email"
            type="email"
            placeholder="e.g. inspector@acme.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={!!errors.email}
            hint={errors.email}
          />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="invite-name">Full name (optional)</Label>
            <Input
              id="invite-name"
              placeholder="e.g. John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="invite-role">Role</Label>
            <Select
              id="invite-role"
              options={ROLE_OPTIONS}
              value={role}
              onChange={(value) => setRole(value)}
              placeholder="Select role"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-100 pt-4 dark:border-navy-700">
          <Button type="button" variant="outline" onClick={handleClose} disabled={isInviting}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isInviting} disabled={isInviting}>
            <MailPlus size={16} /> Send invitation
          </Button>
        </div>
      </form>
    </Modal>
  );
};
