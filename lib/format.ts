import type { Condition } from '@prisma/client';

const conditionLabels: Record<Condition, string> = {
  BRAND_NEW: 'Brand New',
  LIKE_NEW: 'Like New',
  LIGHTLY_USED: 'Lightly Used',
  FAIR: 'Fair',
};

export function formatCondition(condition: Condition | string): string {
  return conditionLabels[condition as Condition] ?? condition.replace(/_/g, ' ');
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-ET', {
    style: 'currency',
    currency: 'ETB',
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatRelativeDate(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return 'Today';
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return date.toLocaleDateString('en-ET', { month: 'short', day: 'numeric', year: 'numeric' });
}
