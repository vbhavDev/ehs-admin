'use client';

import React from 'react';
import { cn } from '@/lib/utils';

const SEGMENTS = [
  { label: 'Weak', color: 'bg-error-500' },
  { label: 'Fair', color: 'bg-warning-500' },
  { label: 'Good', color: 'bg-orange-400' },
  { label: 'Strong', color: 'bg-success-500' },
] as const;

/** 0–4 strength score from length, case mix, digits, and symbols. */
export function passwordStrength(password: string): number {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

const FALLBACK_SEGMENT = { label: 'Weak', color: 'bg-error-500' } as const;

/**
 * Animated 4-segment password strength meter.
 * Exposed as a progressbar for assistive tech.
 */
export function PasswordStrengthMeter({ password }: { password: string }) {
  const score = passwordStrength(password);
  const active = SEGMENTS[Math.max(score - 1, 0)] ?? FALLBACK_SEGMENT;

  return (
    <div
      className="space-y-1.5"
      role="progressbar"
      aria-label="Password strength"
      aria-valuemin={0}
      aria-valuemax={4}
      aria-valuenow={score}
      aria-valuetext={password ? active.label : 'Empty'}
    >
      <div className="flex gap-1.5">
        {SEGMENTS.map((segment, i) => (
          <span
            key={segment.label}
            className={cn(
              'h-1.5 flex-1 rounded-full bg-gray-200 transition-colors duration-300 dark:bg-navy-700',
              i < score && active.color,
            )}
          />
        ))}
      </div>
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
        {password ? (
          <>
            Strength:{' '}
            <span
              className={cn(
                score <= 1 && 'text-error-500',
                score === 2 && 'text-warning-500',
                score === 3 && 'text-orange-400',
                score === 4 && 'text-success-500',
              )}
            >
              {active.label}
            </span>
          </>
        ) : (
          'Use 10+ characters with mixed case, numbers & symbols'
        )}
      </p>
    </div>
  );
}
