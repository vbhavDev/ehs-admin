'use client';
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, CornerDownRight } from 'lucide-react';
import { SidebarMenu } from '@/modules/sidebar-menu/types/sidebar-menu.types';
import DynamicIcon from '@/components/ui/DynamicIcon';

export const SortableMenuItem = ({ menu, index }: { menu: SidebarMenu; index: number }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: menu.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 1000 : 'auto',
  };

  const parentName =
    menu.parentId && typeof menu.parentId === 'object'
      ? (menu.parentId as { name?: string }).name
      : null;
  const isSubmenu = Boolean(menu.parentId);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-4 bg-white dark:bg-gray-900 rounded-xl border transition-all ${
        isSubmenu ? 'ml-6 border-l-4 border-l-brand-400 dark:border-l-brand-500' : ''
      } ${
        isDragging
          ? 'border-brand-500 shadow-xl ring-2 ring-brand-500/10'
          : 'border-gray-200 dark:border-gray-800 hover:border-brand-300 dark:hover:border-brand-800 shadow-sm'
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
      >
        <GripVertical size={20} />
      </div>

      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-950/30 text-brand-600 dark:text-brand-400 text-xs font-black">
        {index + 1}
      </div>

      <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
        <DynamicIcon name={menu.icon || 'LayoutGrid'} size={18} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {isSubmenu && <CornerDownRight size={14} className="text-brand-500 shrink-0" />}
          <h4 className="font-semibold text-gray-900 dark:text-white leading-tight truncate">
            {menu.name}
          </h4>
        </div>
        <p className="text-xs text-gray-500 mt-0.5 truncate">{menu.path}</p>
      </div>

      <div className="flex items-center gap-2">
        {parentName && (
          <div className="text-[10px] font-bold text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-950/50 border border-brand-200 dark:border-brand-900/50 px-2 py-1 rounded-md truncate max-w-[120px]">
            Sub: {parentName}
          </div>
        )}
        <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-md border border-gray-200/60 dark:border-gray-700/60">
          {menu.group || 'MAIN'}
        </div>
      </div>
    </div>
  );
};
