export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  previousText?: string;
  nextText?: string;
  pageOfText?: (current: number, total: number) => string;
}
