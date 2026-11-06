export interface MetricsGridItem {
  id: string;
  label: string;
  value: number | string;
  subtitle?: string;
  suffix?: string;
}

export interface MetricsGridProps {
  items: MetricsGridItem[];
  isLoading?: boolean;
  loadingLabel?: string;
  className?: string;
}
