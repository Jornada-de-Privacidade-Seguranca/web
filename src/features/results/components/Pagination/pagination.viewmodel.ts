import type { PaginationProps } from "./pagination.types";

export function usePaginationVM(props: PaginationProps) {
  const { currentPage, totalPages, onPageChange, previousText, nextText, pageOfText } = props;

  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  const handlePrevious = () => {
    if (canGoPrevious) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (canGoNext) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageSelect = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  const labelPrevious = previousText || "Anterior";
  const labelNext = nextText || "Próximo";
  const labelPageOf = pageOfText
    ? pageOfText(currentPage, totalPages)
    : `Página ${currentPage} de ${totalPages}`;

  return {
    currentPage,
    totalPages,
    pageNumbers,
    canGoPrevious,
    canGoNext,
    handlePrevious,
    handleNext,
    handlePageSelect,
    labelPrevious,
    labelNext,
    labelPageOf,
  };
}
