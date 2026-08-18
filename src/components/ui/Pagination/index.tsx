"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { usePaginationVM } from "./pagination.viewmodel";
import type { PaginationProps } from "./pagination.types";

export function Pagination(props: PaginationProps) {
  const {
    currentPage,
    pageNumbers,
    canGoPrevious,
    canGoNext,
    handlePrevious,
    handleNext,
    handlePageSelect,
    labelPrevious,
    labelNext,
    labelPageOf,
  } = usePaginationVM(props);

  if (props.totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center gap-2 border-t border-border/40 pt-6 mt-8">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePrevious}
          disabled={!canGoPrevious}
          aria-disabled={!canGoPrevious}
          aria-label={labelPrevious}
          className="h-8 px-2.5 rounded-lg text-xs hover:bg-muted/60 disabled:opacity-40"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={14} className="mr-1" />
          {labelPrevious}
        </Button>

        <div className="flex items-center gap-1">
          {pageNumbers.map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => handlePageSelect(page)}
              aria-current={page === currentPage ? "page" : undefined}
              className={`flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-xs font-medium transition-colors ${
                page === currentPage
                  ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {page}
            </button>
          ))}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleNext}
          disabled={!canGoNext}
          aria-disabled={!canGoNext}
          aria-label={labelNext}
          className="h-8 px-2.5 rounded-lg text-xs hover:bg-muted/60 disabled:opacity-40"
        >
          {labelNext}
          <HugeiconsIcon icon={ArrowRight01Icon} size={14} className="ml-1" />
        </Button>
      </div>

      <span className="text-[0.7rem] font-medium text-muted-foreground/80">
        {labelPageOf}
      </span>
    </div>
  );
}

export default Pagination;
