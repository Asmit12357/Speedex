import { LayoutDashboard, Gauge, Activity, BarChart3, History, Info, type LucideIcon } from 'lucide-react';
import type { PageId } from './types';

export interface NavItem {
  id: PageId;
  label: string;
  icon: LucideIcon;
  /** Number key that jumps to this page */
  shortcut: string;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, shortcut: '1' },
  { id: 'speedtest', label: 'Speed Test', icon: Gauge, shortcut: '2' },
  { id: 'analyzer', label: 'Estimator', icon: Activity, shortcut: '3' },
  { id: 'results', label: 'Results', icon: BarChart3, shortcut: '4' },
  { id: 'history', label: 'History', icon: History, shortcut: '5' },
  { id: 'about', label: 'About', icon: Info, shortcut: '6' },
];

export function pageForShortcut(key: string): PageId | undefined {
  return NAV_ITEMS.find((item) => item.shortcut === key)?.id;
}
