'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, LifeBuoy, LogOut, Settings, ShieldCheck, UserCircle2 } from 'lucide-react';
import { Dropdown } from '../ui/dropdown/Dropdown';
import { DropdownItem } from '../ui/dropdown/DropdownItem';
import { useAuthStore } from '@/store/auth.store';
import { useAuth } from '@/hooks/useAuth';
import { useAvatarUrl } from '@/modules/profile/hooks/useProfile';

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { user } = useAuthStore();
  const { logout } = useAuth();
  const avatarUrl = useAvatarUrl(user);

  function toggleDropdown(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  async function handleSignOut() {
    closeDropdown();
    try {
      await logout();
    } finally {
      router.push('/login');
    }
  }

  const firstName = user?.fullName?.split(' ')[0] ?? 'Account';
  const roleName = user?.role?.name ?? null;

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        aria-label="Open account menu"
        className="flex items-center text-gray-700 dark:text-gray-400 dropdown-toggle"
      >
        <span className="mr-3 flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-brand-500/10 text-base font-semibold text-brand-500 ring-1 ring-brand-500/20">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={`${user?.fullName ?? 'User'} profile photo`}
              className="h-full w-full object-cover"
            />
          ) : (
            (user?.fullName?.charAt(0)?.toUpperCase() ?? 'U')
          )}
        </span>

        <span className="block mr-1 font-medium text-theme-sm">{firstName}</span>

        <ChevronDown
          size={18}
          className={`stroke-gray-500 dark:stroke-gray-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-[17px] flex w-[260px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark"
      >
        <div>
          <span className="block font-medium text-gray-700 text-theme-sm dark:text-gray-400">
            {user?.fullName ?? '—'}
          </span>
          <span className="mt-0.5 block text-theme-xs text-gray-500 dark:text-gray-400">
            {user?.email ?? '—'}
          </span>
          {roleName && (
            <span className="mt-2 inline-flex items-center gap-1 rounded-full border border-brand-500/25 bg-brand-500/5 px-2 py-0.5 text-[11px] font-semibold text-brand-600 dark:text-brand-400">
              <ShieldCheck size={12} />
              {roleName}
            </span>
          )}
        </div>

        <ul className="flex flex-col gap-1 pt-4 pb-3 border-b border-gray-200 dark:border-gray-800">
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              href="/profile"
              className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              <UserCircle2
                size={20}
                className="text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300"
              />
              Edit profile
            </DropdownItem>
          </li>
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              href="/settings"
              className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              <Settings
                size={20}
                className="text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300"
              />
              Account settings
            </DropdownItem>
          </li>
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              href="/support-ticket"
              className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              <LifeBuoy
                size={20}
                className="text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300"
              />
              Support
            </DropdownItem>
          </li>
        </ul>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2 mt-3 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
        >
          <LogOut
            size={20}
            className="text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300"
          />
          Sign out
        </button>
      </Dropdown>
    </div>
  );
}
