// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import * as cadastroService from "@services/cadastroService";
import { env } from "@/shared/config/env";
import { useCadastroVM } from "../cadastro.viewmodel";

// Mock next-intl hook. Keys resolve to themselves, except the one used as the
// thrown error message by the dev-only mock trigger, which needs realistic
// content (matching pt.json) for the server-error categorization to match it.
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) =>
    key === "serverError.alreadyRegisteredDescription"
      ? "E-mail ou código de funcionário já cadastrado neste departamento/empresa."
      : key,
}));

describe("Cadastro ViewModel Logic (useCadastroVM)", () => {
  const validFormData = {
    nomeCompleto: "Maria Silva",
    codigoFuncionario: "00123456",
    departamento: "Tecnologia",
    empresa: "ACME Corp",
    email: "maria@empresa.com",
    senha: "Password123!",
    confirmarSenha: "Password123!",
    aceitouTermos: true,
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("deve realizar cadastro com sucesso quando o formulário é válido", async () => {
    const mockResponse = {
      id: "usr_999",
      nomeCompleto: "Maria Silva",
      email: "maria@empresa.com",
      codigoFuncionario: "00123456",
      departamento: "Tecnologia",
      empresa: "ACME Corp",
    };

    const spy = vi
      .spyOn(cadastroService, "registerUser")
      .mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useCadastroVM());

    await act(async () => {
      Object.entries(validFormData).forEach(([key, value]) => {
        result.current.form.setValue(
          key as keyof typeof validFormData,
          value
        );
      });
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(spy).toHaveBeenCalledWith({
      nomeCompleto: "Maria Silva",
      codigoFuncionario: "00123456",
      departamento: "Tecnologia",
      empresa: "ACME Corp",
      email: "maria@empresa.com",
      senha: "Password123!",
    });
    expect(result.current.isSuccess).toBe(true);
    expect(result.current.serverMessage).toEqual({
      title: "serverSuccess.title",
      description: "serverSuccess.description",
      variant: "success",
    });
  });

  it("deve omitir empresa do payload quando isGeneralSystem é false", async () => {
    const spy = vi
      .spyOn(cadastroService, "registerUser")
      .mockResolvedValueOnce({
        id: "usr_100",
        nomeCompleto: "Maria Silva",
        email: "maria@empresa.com",
        codigoFuncionario: "00123456",
        departamento: "Tecnologia",
      });

    const { result } = renderHook(() =>
      useCadastroVM({ isGeneralSystem: false })
    );

    const formDataNoCompany = {
      ...validFormData,
      empresa: "",
    };

    await act(async () => {
      Object.entries(formDataNoCompany).forEach(([key, value]) => {
        result.current.form.setValue(
          key as keyof typeof validFormData,
          value
        );
      });
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(spy).toHaveBeenCalledWith({
      nomeCompleto: "Maria Silva",
      codigoFuncionario: "00123456",
      departamento: "Tecnologia",
      email: "maria@empresa.com",
      senha: "Password123!",
    });
    expect(result.current.isSuccess).toBe(true);
  });

  it("deve falhar a validação se as senhas não coincidirem", async () => {
    const spy = vi.spyOn(cadastroService, "registerUser");
    const { result } = renderHook(() => useCadastroVM());

    const invalidPasswordData = {
      ...validFormData,
      senha: "Password123!",
      confirmarSenha: "PasswordDifferent!",
    };

    await act(async () => {
      Object.entries(invalidPasswordData).forEach(([key, value]) => {
        result.current.form.setValue(
          key as keyof typeof validFormData,
          value,
          { shouldValidate: true, shouldTouch: true, shouldDirty: true }
        );
      });
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(spy).not.toHaveBeenCalled();
    expect(
      result.current.form.formState.errors.confirmarSenha?.message
    ).toBe("validation.passwordsDoNotMatch");
  });

  it("deve tratar erro de usuário já cadastrado vindo do backend", async () => {
    vi.spyOn(cadastroService, "registerUser").mockRejectedValueOnce(
      new Error("E-mail já cadastrado no sistema")
    );

    const { result } = renderHook(() => useCadastroVM());

    await act(async () => {
      Object.entries(validFormData).forEach(([key, value]) => {
        result.current.form.setValue(
          key as keyof typeof validFormData,
          value
        );
      });
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(result.current.serverMessage).toEqual({
      title: "serverError.alreadyRegisteredTitle",
      description: "E-mail já cadastrado no sistema",
      variant: "destructive",
    });
  });

  it("deve tratar erro de campos inválidos vindo do backend", async () => {
    vi.spyOn(cadastroService, "registerUser").mockRejectedValueOnce(
      new Error("Código de funcionário inválido")
    );

    const { result } = renderHook(() => useCadastroVM());

    await act(async () => {
      Object.entries(validFormData).forEach(([key, value]) => {
        result.current.form.setValue(
          key as keyof typeof validFormData,
          value
        );
      });
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(result.current.serverMessage).toEqual({
      title: "serverError.invalidFieldsTitle",
      description: "Código de funcionário inválido",
      variant: "destructive",
    });
  });

  it("deve tratar erro genérico do servidor", async () => {
    vi.spyOn(cadastroService, "registerUser").mockRejectedValueOnce(
      new Error("Erro interno de banco de dados")
    );

    const { result } = renderHook(() => useCadastroVM());

    await act(async () => {
      Object.entries(validFormData).forEach(([key, value]) => {
        result.current.form.setValue(
          key as keyof typeof validFormData,
          value
        );
      });
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(result.current.serverMessage).toEqual({
      title: "serverError.serverErrorTitle",
      description: "serverError.serverErrorDescription",
      variant: "destructive",
    });
  });

  it("deve limpar a mensagem do servidor ao chamar onCloseMsg", async () => {
    vi.spyOn(cadastroService, "registerUser").mockRejectedValueOnce(
      new Error("Erro de servidor")
    );

    const { result } = renderHook(() => useCadastroVM());

    await act(async () => {
      Object.entries(validFormData).forEach(([key, value]) => {
        result.current.form.setValue(
          key as keyof typeof validFormData,
          value
        );
      });
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(result.current.serverMessage).not.toBeNull();

    act(() => {
      result.current.onCloseMsg();
    });

    expect(result.current.serverMessage).toBeNull();
  });

  it("não deve interceptar o e-mail de teste quando env.isDev é false", async () => {
    const originalIsDev = env.isDev;
    (env as { isDev: boolean }).isDev = false;

    const spy = vi.spyOn(cadastroService, "registerUser").mockResolvedValueOnce({
      id: "usr_200",
      nomeCompleto: "Maria Silva",
      email: "duplicado@empresa.com",
      codigoFuncionario: "00123456",
      departamento: "Tecnologia",
      empresa: "ACME Corp",
    });

    const { result } = renderHook(() => useCadastroVM());
    const formData = { ...validFormData, email: "duplicado@empresa.com" };

    try {
      await act(async () => {
        Object.entries(formData).forEach(([key, value]) => {
          result.current.form.setValue(
            key as keyof typeof validFormData,
            value
          );
        });
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({ email: "duplicado@empresa.com" })
      );
      expect(result.current.isSuccess).toBe(true);
    } finally {
      (env as { isDev: boolean }).isDev = originalIsDev;
    }
  });

  it("deve interceptar o e-mail de teste com erro simulado apenas quando env.isDev é true", async () => {
    const originalIsDev = env.isDev;
    (env as { isDev: boolean }).isDev = true;

    const spy = vi.spyOn(cadastroService, "registerUser");
    const { result } = renderHook(() => useCadastroVM());
    const formData = { ...validFormData, email: "duplicado@empresa.com" };

    try {
      await act(async () => {
        Object.entries(formData).forEach(([key, value]) => {
          result.current.form.setValue(
            key as keyof typeof validFormData,
            value
          );
        });
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(spy).not.toHaveBeenCalled();
      expect(result.current.serverMessage?.title).toBe(
        "serverError.alreadyRegisteredTitle"
      );
    } finally {
      (env as { isDev: boolean }).isDev = originalIsDev;
    }
  });
});
