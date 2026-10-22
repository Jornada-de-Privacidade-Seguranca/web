import { describe, it, expect, vi, beforeEach } from "vitest";
import * as httpClient from "../httpClient";
import {
  getCourseOptions,
  getSelectedCourses,
  saveSelectedCourses,
} from "../academicCoursesService";

const course = {
  id: 1,
  name_pt: "Ciência da Computação",
  name_en: "Computer Science",
  type: { id: 1, name_pt: "Graduação", name_en: "Graduation" },
};

describe("academicCoursesService", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("deve buscar todos os cursos disponíveis, sem filtrar por nível", async () => {
    const spy = vi.spyOn(httpClient, "apiRequest").mockResolvedValue([course]);

    const result = await getCourseOptions();

    expect(result).toEqual([course]);
    expect(spy).toHaveBeenCalledWith(
      "/journeys/current/courses/options",
      {},
      expect.any(String)
    );
  });

  it("deve buscar os cursos já selecionados na jornada em andamento", async () => {
    const spy = vi.spyOn(httpClient, "apiRequest").mockResolvedValue([course]);

    await getSelectedCourses();

    expect(spy).toHaveBeenCalledWith("/journeys/current/courses", {}, expect.any(String));
  });

  it("deve salvar a seleção com PUT, CSRF e course_ids (inclusive lista vazia)", async () => {
    const spy = vi.spyOn(httpClient, "apiRequest").mockResolvedValue([]);

    await saveSelectedCourses([1, 4, 7]);
    await saveSelectedCourses([]);

    expect(spy).toHaveBeenNthCalledWith(
      1,
      "/journeys/current/courses",
      { method: "put", data: { course_ids: [1, 4, 7] }, withCsrf: true },
      expect.any(String)
    );
    expect(spy).toHaveBeenNthCalledWith(
      2,
      "/journeys/current/courses",
      { method: "put", data: { course_ids: [] }, withCsrf: true },
      expect.any(String)
    );
  });
});
