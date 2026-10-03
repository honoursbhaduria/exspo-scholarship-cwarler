import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  DashboardSquare01Icon,
  Mortarboard01Icon,
  ShieldAlertIcon,
  Activity01Icon,
  Search01Icon,
  FilterIcon,
  ViewIcon,
  ArrowUpRight01Icon,
  Cancel01Icon,
  Copy01Icon,
  CheckmarkCircle02Icon,
  CheckmarkBadge01Icon,
  AlertCircleIcon,
  Clock01Icon,
  Calendar03Icon,
  Coins01Icon,
  Money03Icon,
  Time02Icon,
  FingerPrintIcon,
  CodeIcon,
  File01Icon,
  QuoteDownIcon,
  SparklesIcon,
  RefreshIcon,
  Database01Icon,
  ArrowRight01Icon,
  User02Icon,
  DiplomaIcon,
  Building03Icon,
} from '@hugeicons/core-free-icons';

export {
  HugeiconsIcon,
  DashboardSquare01Icon,
  Mortarboard01Icon,
  ShieldAlertIcon,
  Activity01Icon,
  Search01Icon,
  FilterIcon,
  ViewIcon,
  ArrowUpRight01Icon,
  Cancel01Icon,
  Copy01Icon,
  CheckmarkCircle02Icon,
  CheckmarkBadge01Icon,
  AlertCircleIcon,
  Clock01Icon,
  Calendar03Icon,
  Coins01Icon,
  Money03Icon,
  Time02Icon,
  FingerPrintIcon,
  CodeIcon,
  File01Icon,
  QuoteDownIcon,
  SparklesIcon,
  RefreshIcon,
  Database01Icon,
  ArrowRight01Icon,
  User02Icon,
  DiplomaIcon,
  Building03Icon,
};

export interface HugeIconProps {
  icon: any;
  size?: number;
  className?: string;
}

export const AppIcon: React.FC<HugeIconProps> = ({ icon, size = 18, className }) => {
  return <HugeiconsIcon icon={icon} size={size} className={className} />;
};
