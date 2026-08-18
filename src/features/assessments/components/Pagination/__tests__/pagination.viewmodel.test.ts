// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePaginationVM } from "../pagination.viewmodel";

describe("usePaginationVM", () => {
  it("deve calcular corretamente canGoPrevious e canGoNext na primeira página", () => {
    const onPageChange = vi.fn();
    const { result } = renderHook(() =>
      usePaginationVM({
        currentPage: 1,
        totalPages: 5,
        onPageChange,
      })
    );

    expect(result.current.canGoPrevious).toBe(false);
    expect(result.current.canGoNext).toBe(true);
    expect(result.current.pageNumbers).toEqual([1, 2, 3, 4, 5]);

    act(() => {
      result.current.handlePrevious();
    });

    expect(onPageChange).not.toHaveBeenCalled();
  });

  it("deve chamar onPageChange com a página anterior e próxima quando estiver em página intermediária", () => {
    const onPageChange = vi.fn();
    const { result } = renderHook(() =>
      usePaginationVM({
        currentPage: 3,
        totalPages: 5,
        onPageChange,
      })
    );

    expect(result.current.canGoPrevious).toBe(true);
    expect(result.current.canGoNext).toBe(true);

    act(() => {
      result.current.handlePrevious();
    });
    expect(onPageChange).toHaveBeenCalledWith(2);

    act(() => {
      result.current.handleNext();
    });
    expect(onPageChange).toHaveBeenCalledWith(4);
  });

  it("deve desabilitar canGoNext na última página e não acionar onPageChange ao tentar avançar", () => {
    const onPageChange = vi.fn();
    const { result } = renderHook(() =>
      usePaginationVM({
        currentPage: 5,
        totalPages: 5,
        onPageChange,
      })
    );

    expect(result.current.canGoPrevious).toBe(true);
    expect(result.current.canGoNext).toBe(false);

    act(() => {
      result.current.handleNext();
    });

    expect(onPageChange).not.toHaveBeenCalled();
  });

  it("deve chamar onPageChange ao selecionar uma página válida diferente da atual", () => {
    const onPageChange = vi.fn();
    const { result } = renderHook(() =>
      usePaginationVM({
        currentPage: 2,
        totalPages: 5,
        onPageChange,
      })
    );

    act(() => {
      result.current.handlePageSelect(4);
    });

    expect(onPageChange).toHaveBeenCalledWith(4);

    act(() => {
      result.current.handlePageSelect(2);
    });

    expect(onPageChange).toHaveBeenCalledTimes(1);
  });
});
