'use client';
import React, { useEffect, useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Check, X } from 'lucide-react';
import {
  SubscriptionPlan,
  SUBSCRIPTION_PLAN_TIER_LABELS,
  getTierVisual,
  getHeadlineCycle,
  CYCLE_DURATION_SUFFIX,
} from '@/types/subscription-plan.types';
import { useSubscriptionPlans } from '../hooks/useSubscriptionPlans';
import Button from '@/components/ui/button/Button';

interface SubscriptionPlanReorderProps {
  onDone: () => void;
}

function SortablePlanRow({ plan, index }: { plan: SubscriptionPlan; index: number }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: plan.id,
  });
  const visual = getTierVisual(plan.tier);
  const headline = getHeadlineCycle(plan);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 rounded-xl border bg-white p-4 transition-all dark:bg-navy-800 ${
        isDragging
          ? 'border-brand-500 shadow-theme-lg ring-2 ring-brand-500/10'
          : 'border-gray-200 shadow-theme-xs hover:border-brand-300 dark:border-navy-700 dark:hover:border-navy-600'
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        aria-label={`Drag to reorder ${plan.name}`}
        className="cursor-grab p-1 text-gray-400 transition-colors hover:text-gray-600 active:cursor-grabbing dark:hover:text-gray-300"
      >
        <GripVertical size={20} />
      </div>

      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-xs font-black text-gray-600 dark:bg-navy-700 dark:text-gray-300">
        {index + 1}
      </div>

      <span className={`h-3 w-3 shrink-0 rounded-full ${visual.solid}`} />

      <div className="min-w-0 flex-1">
        <h4 className="truncate text-sm font-semibold text-gray-900 dark:text-white">
          {plan.name}
        </h4>
        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
          {headline
            ? headline.cycle.price === 0
              ? 'Free'
              : `${headline.currencyCode} ${headline.cycle.price.toLocaleString()}${
                  CYCLE_DURATION_SUFFIX[headline.cycle.duration] || `/${headline.cycle.duration}`
                }`
            : 'No pricing set'}
        </p>
      </div>

      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${visual.chip}`}
      >
        {SUBSCRIPTION_PLAN_TIER_LABELS[plan.tier] || plan.tier}
      </span>
    </div>
  );
}

export const SubscriptionPlanReorder: React.FC<SubscriptionPlanReorderProps> = ({ onDone }) => {
  // Fetch the full ordered list (no pagination/search) for reordering.
  const { plans, isLoading, reorderPlans, isReordering } = useSubscriptionPlans({
    page: 1,
    limit: 100,
  });
  const [items, setItems] = useState<SubscriptionPlan[]>([]);

  useEffect(() => {
    setItems(plans);
  }, [plans]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setItems((current) => {
      const oldIndex = current.findIndex((p) => p.id === active.id);
      const newIndex = current.findIndex((p) => p.id === over.id);
      return arrayMove(current, oldIndex, newIndex);
    });
  };

  const handleSave = async () => {
    await reorderPlans(items.map((p, i) => ({ id: p.id, order: i })));
    onDone();
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-[68px] animate-pulse rounded-xl border border-gray-200 bg-white dark:border-navy-700 dark:bg-navy-800"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3 rounded-xl border border-brand-200 bg-brand-50/60 p-4 dark:border-brand-500/30 dark:bg-brand-500/10">
        <GripVertical size={18} className="mt-0.5 shrink-0 text-brand-500" />
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Drag plans into the order they should appear on the <strong>client app</strong> pricing
          page, then save. Position <strong>1</strong> is shown first.
        </p>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((p) => p.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {items.map((plan, index) => (
              <SortablePlanRow key={plan.id} plan={plan} index={index} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="flex justify-end gap-3 border-t border-gray-100 pt-5 dark:border-navy-700">
        <Button type="button" variant="outline" onClick={onDone} disabled={isReordering}>
          <X size={16} /> Cancel
        </Button>
        <Button type="button" onClick={handleSave} isLoading={isReordering} disabled={isReordering}>
          <Check size={16} /> Save order
        </Button>
      </div>
    </div>
  );
};
