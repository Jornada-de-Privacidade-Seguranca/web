// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import * as cadastroService from "@services/cadastroService";
import { useCadastroVM } from "../cadastro.viewmodel";

// Mock next-intl hook
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
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
});
