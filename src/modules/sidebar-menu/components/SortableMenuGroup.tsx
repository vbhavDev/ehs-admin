'use client';
import React from 'react';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Layers } from 'lucide-react';
import { SidebarMenu } from '@/modules/sidebar-menu/types/sidebar-menu.types';
import { SortableMenuItem } from './SortableMenuItem';

export interface GroupData {
  id: string; // e.g. "group:main"
  name: string; // e.g. "main"
  items: SidebarMenu[];
}

interface SortableMenuGroupProps {
  group: GroupData;
  groupIndex: number;
  globalOffsetIndex: number;
}

export const SortableMenuGroup: React.FC<SortableMenuGroupProps> = ({
  group,
  groupIndex,
  globalOffsetIndex,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: group.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 1000 : 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-2xl border transition-all ${
        isDragging
          ? 'border-brand-500 bg-brand-50/20 dark:bg-brand-950/20 shadow-2xl ring-4 ring-brand-500/10'
          : 'border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/40 hover:border-brand-300 dark:hover:border-brand-800/60 shadow-sm'
      }`}
    >
      {/* Group Header - Drag handle for entire group */}
      <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 rounded-t-2xl border-b border-gray-200/80 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Drag to reorder entire group"
          >
            <GripVertical size={20} />
          </div>

          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand-500 text-white font-bold text-xs shadow-sm">
            G{groupIndex + 1}
          </div>

          <div className="flex items-center gap-2">
            <Layers size={18} className="text-brand-500" />
            <h3 className="font-bold text-base text-gray-900 dark:text-white uppercase tracking-wider">
              {group.name}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700">
            {group.items.length} {group.items.length === 1 ? 'item' : 'items'}
          </span>
        </div>
      </div>

      {/* Group Items Container */}
      <div className="p-4 space-y-3">
        <SortableContext
          items={group.items.map((i) => i.id || (i as unknown as { _id?: string })._id || '')}
          strategy={verticalListSortingStrategy}
        >
          {group.items.length > 0 ? (
            group.items.map((menu, itemIdx) => (
              <SortableMenuItem
                key={menu.id || (menu as unknown as { _id?: string })._id || ''}
                menu={menu}
                index={globalOffsetIndex + itemIdx}
              />
            ))
          ) : (
            <div className="p-6 text-center text-xs text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
              Drag menu items here to move them into {group.name.toUpperCase()}
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  );
};
