'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, Clock } from 'lucide-react';

export interface DatePickerProps {
  value?: string; // YYYY-MM-DD format
  onChange: (dateStr: string) => void;
  label?: string;
  placeholder?: string;
  minDate?: string;
  maxDate?: string;
  disabled?: boolean;
  error?: string;
  showPresets?: boolean;
  className?: string;
  accentColor?: 'brand' | 'emerald' | 'indigo' | 'amber';
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const WEEKDAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  label,
  placeholder = 'Select date...',
  minDate,
  maxDate,
  disabled = false,
  error,
  showPresets = true,
  className = '',
  accentColor = 'brand',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Parse current date or fallback to today
  const selectedDate = value ? new Date(value) : null;
  const isSelectedValid = selectedDate && !isNaN(selectedDate.getTime());

  // View state for navigating months in calendar
  const [viewDate, setViewDate] = useState<Date>(() => {
    return isSelectedValid ? new Date(selectedDate.getTime()) : new Date();
  });

  // Keep viewDate in sync when value changes externally
  useEffect(() => {
    if (isSelectedValid) {
      setViewDate(new Date(selectedDate.getTime()));
    }
  }, [value]);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const handlePrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const handleTodayView = () => {
    const today = new Date();
    setViewDate(today);
    const todayStr = formatDateToString(today);
    onChange(todayStr);
  };

  const formatDateToString = (d: Date): string => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // Build grid of 42 days (6 weeks)
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const calendarDays: Array<{
    date: Date;
    dateStr: string;
    dayNum: number;
    isCurrentMonth: boolean;
    isToday: boolean;
    isSelected: boolean;
    isDisabled: boolean;
  }> = [];

  const todayStr = formatDateToString(new Date());
  const formattedSelectedStr = isSelectedValid ? formatDateToString(selectedDate) : '';

  // Previous month padding days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    const date = new Date(year, month - 1, dayNum);
    const dateStr = formatDateToString(date);
    calendarDays.push({
      date,
      dateStr,
      dayNum,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      isSelected: dateStr === formattedSelectedStr,
      isDisabled: checkIsDisabled(dateStr, minDate, maxDate),
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const dateStr = formatDateToString(date);
    calendarDays.push({
      date,
      dateStr,
      dayNum: d,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
      isSelected: dateStr === formattedSelectedStr,
      isDisabled: checkIsDisabled(dateStr, minDate, maxDate),
    });
  }

  // Next month padding days to fill 42 cells
  const remainingCells = 42 - calendarDays.length;
  for (let d = 1; d <= remainingCells; d++) {
    const date = new Date(year, month + 1, d);
    const dateStr = formatDateToString(date);
    calendarDays.push({
      date,
      dateStr,
      dayNum: d,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      isSelected: dateStr === formattedSelectedStr,
      isDisabled: checkIsDisabled(dateStr, minDate, maxDate),
    });
  }

  function checkIsDisabled(dateStr: string, min?: string, max?: string): boolean {
    if (min && dateStr < min) return true;
    if (max && dateStr > max) return true;
    return false;
  }

  const handleSelectDay = (dayObj: (typeof calendarDays)[0]) => {
    if (dayObj.isDisabled) return;
    onChange(dayObj.dateStr);
    setIsOpen(false);
  };

  // Presets
  const applyPreset = (presetType: 'today' | 'tomorrow' | 'nextWeek' | '1stNextMonth') => {
    const now = new Date();
    let target = new Date();

    if (presetType === 'today') {
      target = now;
    } else if (presetType === 'tomorrow') {
      target.setDate(now.getDate() + 1);
    } else if (presetType === 'nextWeek') {
      target.setDate(now.getDate() + 7);
    } else if (presetType === '1stNextMonth') {
      target = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    }

    const str = formatDateToString(target);
    onChange(str);
    setViewDate(target);
  };

  // Format string for input preview
  const displayFormattedDate = isSelectedValid
    ? selectedDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  // Accent class mappings
  const accentGradients = {
    brand: 'from-brand-500 to-indigo-600 shadow-brand-500/20 text-brand-500',
    emerald: 'from-emerald-500 to-teal-600 shadow-emerald-500/20 text-emerald-500',
    indigo: 'from-indigo-500 to-purple-600 shadow-indigo-500/20 text-indigo-500',
    amber: 'from-amber-500 to-orange-600 shadow-amber-500/20 text-amber-500',
  };

  const accentSelectedBg = {
    brand:
      'bg-gradient-to-br from-brand-500 to-indigo-600 text-white shadow-md shadow-brand-500/30 font-black scale-105',
    emerald:
      'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/30 font-black scale-105',
    indigo:
      'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/30 font-black scale-105',
    amber:
      'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/30 font-black scale-105',
  };

  return (
    <div className={`relative w-full ${className}`} ref={popoverRef}>
      {label && (
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
          <CalendarIcon size={14} className={accentGradients[accentColor].split(' ').pop()} />
          {label}
        </label>
      )}

      {/* Main Trigger Input Bar */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl border transition-all duration-200 cursor-pointer shadow-sm ${
          disabled ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-navy-800' : ''
        } ${
          isOpen
            ? 'border-brand-500 ring-2 ring-brand-500/30 bg-white dark:bg-navy-900 shadow-md'
            : 'border-gray-200 dark:border-navy-700 bg-white dark:bg-navy-800/90 hover:border-gray-300 dark:hover:border-navy-600'
        } ${error ? 'border-rose-500 ring-2 ring-rose-500/20' : ''}`}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div
            className={`p-1.5 rounded-lg bg-gradient-to-br ${accentGradients[accentColor]} text-white shadow-sm flex-shrink-0 transition-transform duration-200 group-hover:scale-105`}
          >
            <CalendarIcon size={16} />
          </div>

          <div className="truncate">
            {isSelectedValid ? (
              <div className="flex flex-col">
                <span className="text-sm font-extrabold text-gray-900 dark:text-white truncate">
                  {displayFormattedDate}
                </span>
                <span className="text-[10px] text-gray-400 font-medium">{value}</span>
              </div>
            ) : (
              <span className="text-sm text-gray-400 dark:text-gray-500 font-medium">
                {placeholder}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
          {isSelectedValid && !disabled && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
              }}
              className="p-1 rounded-md text-gray-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
              title="Clear date"
            >
              <X size={14} />
            </button>
          )}

          <div
            className={`p-1 rounded-lg text-gray-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-brand-500' : ''
            }`}
          >
            <ChevronRight size={16} className="rotate-90" />
          </div>
        </div>
      </div>

      {error && <p className="text-xs text-rose-500 font-semibold mt-1">{error}</p>}

      {/* Floating Pro Max Calendar Popover */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-2 z-50 w-80 p-4 rounded-2xl bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-700 shadow-2xl shadow-navy-950/30 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
          {/* Header Month/Year Controls */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-navy-800">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-navy-800 text-gray-600 dark:text-gray-300 transition-colors"
              title="Previous Month"
            >
              <ChevronLeft size={18} />
            </button>

            <div className="flex items-center gap-1">
              <span className="font-extrabold text-sm text-gray-900 dark:text-white">
                {MONTH_NAMES[month]}
              </span>
              <span className="font-bold text-sm text-brand-500 dark:text-brand-400">{year}</span>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-navy-800 text-gray-600 dark:text-gray-300 transition-colors"
              title="Next Month"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Quick Presets Bar */}
          {showPresets && (
            <div className="flex items-center justify-between gap-1 mb-3 p-1 rounded-xl bg-gray-50 dark:bg-navy-800/60 border border-gray-100 dark:border-navy-800">
              <button
                type="button"
                onClick={() => applyPreset('today')}
                className="flex-1 py-1 text-[10px] font-bold rounded-lg text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-navy-700 hover:text-brand-500 dark:hover:text-brand-400 transition-all text-center"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => applyPreset('tomorrow')}
                className="flex-1 py-1 text-[10px] font-bold rounded-lg text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-navy-700 hover:text-brand-500 dark:hover:text-brand-400 transition-all text-center"
              >
                Tomorrow
              </button>
              <button
                type="button"
                onClick={() => applyPreset('nextWeek')}
                className="flex-1 py-1 text-[10px] font-bold rounded-lg text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-navy-700 hover:text-brand-500 dark:hover:text-brand-400 transition-all text-center"
              >
                +7 Days
              </button>
              <button
                type="button"
                onClick={() => applyPreset('1stNextMonth')}
                className="flex-1 py-1 text-[10px] font-bold rounded-lg text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-navy-700 hover:text-brand-500 dark:hover:text-brand-400 transition-all text-center truncate px-1"
              >
                1st Next Mo
              </button>
            </div>
          )}

          {/* Weekday Labels Grid */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {WEEKDAY_NAMES.map((w, idx) => (
              <span
                key={w}
                className={`text-[11px] font-black tracking-wider py-1 ${
                  idx === 0 || idx === 6
                    ? 'text-brand-500/70 dark:text-brand-400/70'
                    : 'text-gray-400 dark:text-gray-500'
                }`}
              >
                {w}
              </span>
            ))}
          </div>

          {/* Days Grid (6 Rows x 7 Cols) */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, idx) => (
              <button
                key={idx}
                type="button"
                disabled={day.isDisabled}
                onClick={() => handleSelectDay(day)}
                className={`h-9 w-full rounded-xl text-xs transition-all duration-150 flex flex-col items-center justify-center relative ${
                  day.isDisabled
                    ? 'opacity-25 cursor-not-allowed text-gray-400'
                    : day.isSelected
                      ? accentSelectedBg[accentColor]
                      : day.isToday
                        ? 'font-black text-brand-600 dark:text-brand-400 bg-brand-500/10 border border-brand-500/30'
                        : day.isCurrentMonth
                          ? 'font-semibold text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-navy-800 hover:scale-105'
                          : 'font-normal text-gray-400 dark:text-gray-600 hover:bg-gray-50 dark:hover:bg-navy-800/50'
                }`}
              >
                <span>{day.dayNum}</span>

                {/* Subtle indicator dot for Today when not selected */}
                {day.isToday && !day.isSelected && (
                  <span className="w-1 h-1 rounded-full bg-brand-500 absolute bottom-1" />
                )}
              </button>
            ))}
          </div>

          {/* Footer Bar */}
          <div className="mt-3 pt-2.5 border-t border-gray-100 dark:border-navy-800 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={handleTodayView}
              className="text-[11px] font-extrabold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
            >
              <Clock size={12} /> Jump to Today
            </button>

            {isSelectedValid && (
              <span className="text-[10px] font-bold text-gray-400">
                {selectedDate.getFullYear()}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
