'use client';
import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSidebarMenus } from '../hooks/useSidebarMenus';
import { SidebarMenu } from '@/modules/sidebar-menu/types/sidebar-menu.types';
import { SortableMenuGroup, GroupData } from './SortableMenuGroup';
import Button from '@/components/ui/button/Button';
import { Save, GripVertical, Layers } from 'lucide-react';
import DynamicIconComponent from '@/components/ui/DynamicIcon';

export const MenuTreeBuilder: React.FC = () => {
  const { dropdownSidebarMenus, menus, reorderSidebarMenus, isProcessing } = useSidebarMenus();
  const sourceList = dropdownSidebarMenus.length > 0 ? dropdownSidebarMenus : menus;

  const [groups, setGroups] = useState<GroupData[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (sourceList && sourceList.length > 0) {
      // 1. Sort source items by order
      const sortedSource = [...sourceList].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

      // 2. Group items by group name (preserve group appearance order)
      const groupMap = new Map<string, SidebarMenu[]>();
      sortedSource.forEach((item) => {
        const gName = (item.group || 'MAIN').toLowerCase();
        if (!groupMap.has(gName)) {
          groupMap.set(gName, []);
        }
        groupMap.get(gName)!.push(item);
      });

      // 3. Convert map to GroupData array
      const groupedData: GroupData[] = Array.from(groupMap.entries()).map(([gName, items]) => ({
        id: `group:${gName}`,
        name: gName,
        items,
      }));

      setGroups(groupedData);
    }
  }, [sourceList]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeIdStr = String(active.id);
    const overIdStr = String(over.id);

    // Case 1: Reordering ENTIRE Groups
    if (activeIdStr.startsWith('group:')) {
      if (activeIdStr !== overIdStr && overIdStr.startsWith('group:')) {
        setGroups((prevGroups) => {
          const oldIndex = prevGroups.findIndex((g) => g.id === activeIdStr);
          const newIndex = prevGroups.findIndex((g) => g.id === overIdStr);
          if (oldIndex !== -1 && newIndex !== -1) {
            return arrayMove(prevGroups, oldIndex, newIndex);
          }
          return prevGroups;
        });
      }
      return;
    }

    // Case 2: Reordering Individual Menu Items within or across groups
    let sourceGroupIdx = -1;
    let sourceItemIdx = -1;

    groups.forEach((g, gIdx) => {
      const itemIdx = g.items.findIndex(
        (i) => (i.id || (i as unknown as { _id?: string })._id) === activeIdStr,
      );
      if (itemIdx !== -1) {
        sourceGroupIdx = gIdx;
        sourceItemIdx = itemIdx;
      }
    });

    if (sourceGroupIdx === -1) return;

    // Find destination group & position
    let destGroupIdx = -1;
    let destItemIdx = -1;

    if (overIdStr.startsWith('group:')) {
      destGroupIdx = groups.findIndex((g) => g.id === overIdStr);
      destItemIdx = groups[destGroupIdx]?.items.length ?? 0;
    } else {
      groups.forEach((g, gIdx) => {
        const itemIdx = g.items.findIndex(
          (i) => (i.id || (i as unknown as { _id?: string })._id) === overIdStr,
        );
        if (itemIdx !== -1) {
          destGroupIdx = gIdx;
          destItemIdx = itemIdx;
        }
      });
    }

    if (destGroupIdx === -1) return;

    setGroups((prevGroups) => {
      const newGroups = JSON.parse(JSON.stringify(prevGroups)) as GroupData[];
      const sourceGroup = newGroups[sourceGroupIdx];
      const destGroup = newGroups[destGroupIdx];

      if (!sourceGroup || !destGroup) return prevGroups;

      const [movedItem] = sourceGroup.items.splice(sourceItemIdx, 1);
      if (!movedItem) return prevGroups;

      // Update item's group property
      movedItem.group = destGroup.name;

      if (sourceGroupIdx === destGroupIdx) {
        // Reordering within the same group
        sourceGroup.items.splice(destItemIdx, 0, movedItem);
      } else {
        // Moving to a different group
        destGroup.items.splice(destItemIdx, 0, movedItem);
      }

      return newGroups;
    });
  };

  const handleSave = async () => {
    let globalOrder = 0;
    const reorderData: { id: string; parentId: string | null; order: number; group: string }[] = [];

    groups.forEach((g) => {
      g.items.forEach((item) => {
        const parentObj = item.parentId as { id?: string; _id?: string } | null | undefined;
        const pId = item.parentId
          ? typeof item.parentId === 'object'
            ? parentObj?.id || parentObj?._id || null
            : item.parentId
          : null;

        const itemId = item.id || (item as unknown as { _id?: string })._id || '';

        reorderData.push({
          id: itemId,
          parentId: pId,
          order: globalOrder++,
          group: g.name.toLowerCase(),
        });
      });
    });

    await reorderSidebarMenus(reorderData);
  };

  // Helper to calculate global item offsets for numbered badges
  let currentOffset = 0;

  // Active dragged item or group calculation for DragOverlay
  const isDraggingGroup = activeId ? activeId.startsWith('group:') : false;
  const activeGroup = isDraggingGroup ? groups.find((g) => g.id === activeId) : null;

  let activeItem: SidebarMenu | null = null;
  if (!isDraggingGroup && activeId) {
    for (const g of groups) {
      const item = g.items.find(
        (i) => (i.id || (i as unknown as { _id?: string })._id) === activeId,
      );
      if (item) {
        activeItem = item;
        break;
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-brand-50/50 dark:bg-brand-950/10 p-4 rounded-2xl border border-brand-100 dark:border-brand-900/30">
        <div className="flex-1">
          <h3 className="text-sm font-bold text-brand-900 dark:text-brand-400">
            Reorder Menu Groups & Sidebar Items
          </h3>
          <p className="text-xs text-brand-600 dark:text-brand-500 mt-1">
            Drag entire <strong>Group cards</strong> using the top header handle to reorder menu
            sections, or drag <strong>individual items</strong> inside/between groups.
          </p>
        </div>
        <Button
          onClick={handleSave}
          startIcon={<Save size={18} />}
          disabled={isProcessing}
          className="shrink-0 shadow-lg shadow-brand-500/20"
        >
          {isProcessing ? 'Saving...' : 'Save Structure'}
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={groups.map((g) => g.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-6">
            {groups.map((group, groupIndex) => {
              const offsetForThisGroup = currentOffset;
              currentOffset += group.items.length;

              return (
                <SortableMenuGroup
                  key={group.id}
                  group={group}
                  groupIndex={groupIndex}
                  globalOffsetIndex={offsetForThisGroup}
                />
              );
            })}
          </div>
        </SortableContext>

        {/* Drag Overlay Preview */}
        <DragOverlay
          dropAnimation={{
            sideEffects: defaultDropAnimationSideEffects({
              styles: {
                active: {
                  opacity: '0.6',
                },
              },
            }),
          }}
        >
          {isDraggingGroup && activeGroup ? (
            <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 rounded-2xl border-2 border-brand-500 shadow-2xl ring-4 ring-brand-500/20">
              <div className="flex items-center gap-3">
                <GripVertical size={20} className="text-brand-500" />
                <Layers size={20} className="text-brand-500" />
                <h3 className="font-bold text-base text-gray-900 dark:text-white uppercase">
                  {activeGroup.name}
                </h3>
              </div>
              <span className="text-xs font-semibold text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                {activeGroup.items.length} items
              </span>
            </div>
          ) : activeItem ? (
            <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-900 rounded-xl border-2 border-brand-500 shadow-2xl ring-4 ring-brand-500/10">
              <div className="text-brand-500">
                <GripVertical size={20} />
              </div>
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                <DynamicIconComponent
                  name={(activeItem as SidebarMenu).icon || 'LayoutGrid'}
                  size={18}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 dark:text-white leading-tight">
                  {(activeItem as SidebarMenu).name}
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">{(activeItem as SidebarMenu).path}</p>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};
