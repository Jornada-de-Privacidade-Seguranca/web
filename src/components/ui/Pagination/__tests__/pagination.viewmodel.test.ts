import { describe, it, expect, vi } from "vitest";
import { usePaginationVM } from "../pagination.viewmodel";

describe("usePaginationVM", () => {
  it("deve calcular corretamente os botões anterior/próximo e a lista de páginas", () => {
    const onPageChangeMock = vi.fn();
    const vm = usePaginationVM({
      currentPage: 2,
      totalPages: 5,
      onPageChange: onPageChangeMock,
    });

    expect(vm.canGoPrevious).toBe(true);
    expect(vm.canGoNext).toBe(true);
    expect(vm.pageNumbers).toEqual([1, 2, 3, 4, 5]);

    vm.handlePrevious();
    expect(onPageChangeMock).toHaveBeenCalledWith(1);

    vm.handleNext();
    expect(onPageChangeMock).toHaveBeenCalledWith(3);
  });

  it("deve desabilitar navegacao nas bordas", () => {
    const onPageChangeMock = vi.fn();
    const vmFirst = usePaginationVM({
      currentPage: 1,
      totalPages: 3,
      onPageChange: onPageChangeMock,
    });

    expect(vmFirst.canGoPrevious).toBe(false);
    expect(vmFirst.canGoNext).toBe(true);

    vmFirst.handlePrevious();
    expect(onPageChangeMock).not.toHaveBeenCalled();

    const vmLast = usePaginationVM({
      currentPage: 3,
      totalPages: 3,
      onPageChange: onPageChangeMock,
    });

    expect(vmLast.canGoNext).toBe(false);
    vmLast.handleNext();
    expect(onPageChangeMock).not.toHaveBeenCalled();
  });
});
