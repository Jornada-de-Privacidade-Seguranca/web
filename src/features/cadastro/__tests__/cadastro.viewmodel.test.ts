// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import * as cadastroService from "@services/cadastroService";
import { CadastroRequestError } from "@services/cadastroService";
import type { CadastroResponse } from "../cadastro.types";
import { useCadastroVM } from "../cadastro.viewmodel";

// As chaves de tradução resolvem para elas mesmas
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

const createdUser: CadastroResponse = {
  id: 7,
  name: "Maria Silva",
  email: "maria@empresa.com",
  organization_company: "ACME Corp",
  department: "Tecnologia",
  registration_number: "00123456",
  profile_type_id: 3,
  journey_profile_id: null,
  active_status: 2,
  account_status: "pending_activation",
  created_at: "2026-11-06 10:00:00",
};

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
    const spy = vi
      .spyOn(cadastroService, "registerUser")
      .mockResolvedValueOnce(createdUser);

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
      confirmarSenha: "Password123!",
    });
    expect(result.current.isSuccess).toBe(true);
    expect(result.current.serverMessage).toEqual({
      title: "serverSuccess.title",
      description: "serverSuccess.description",
      variant: "success",
    });
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

  async function fillAndSubmit(
    result: { current: ReturnType<typeof useCadastroVM> },
    data: Record<string, string | boolean> = validFormData
  ) {
    await act(async () => {
      Object.entries(data).forEach(([key, value]) => {
        result.current.form.setValue(key as keyof typeof validFormData, value);
      });
    });
    await act(async () => {
      await result.current.handleSubmit();
    });
  }

  it.each([
    ["nome sem sobrenome", { nomeCompleto: "Maria" }, "nomeCompleto", "validation.fullNameLastName"],
    ["nome com mais de 50 caracteres", { nomeCompleto: `Maria ${"a".repeat(45)}` }, "nomeCompleto", "validation.fullNameMaxLength"],
    ["e-mail com mais de 100 caracteres", { email: `${"a".repeat(90)}@empresa.com` }, "email", "validation.emailMaxLength"],
    ["senha com mais de 100 caracteres", { senha: "a".repeat(101), confirmarSenha: "a".repeat(101) }, "senha", "validation.passwordMaxLength"],
    ["empresa vazia", { empresa: "" }, "empresa", "validation.companyRequired"],
    ["empresa com mais de 100 caracteres", { empresa: "a".repeat(101) }, "empresa", "validation.companyMaxLength"],
    ["departamento com mais de 100 caracteres", { departamento: "a".repeat(101) }, "departamento", "validation.departmentMaxLength"],
    ["código de funcionário com mais de 50 caracteres", { codigoFuncionario: "a".repeat(51) }, "codigoFuncionario", "validation.employeeCodeMaxLength"],
  ])("deve recusar %s antes do envio", async (_case, overrides, field, message) => {
    const spy = vi.spyOn(cadastroService, "registerUser");
    const { result } = renderHook(() => useCadastroVM());

    await fillAndSubmit(result, { ...validFormData, ...overrides });

    expect(spy).not.toHaveBeenCalled();
    expect(
      result.current.form.formState.errors[field as keyof typeof validFormData]?.message
    ).toBe(message);
  });

  it("deve mostrar o aviso próprio quando o e-mail já está cadastrado", async () => {
    vi.spyOn(cadastroService, "registerUser").mockRejectedValueOnce(
      new CadastroRequestError("already_registered", "Ja existe uma conta cadastrada com este e-mail.")
    );
    const { result } = renderHook(() => useCadastroVM());

    await fillAndSubmit(result);

    expect(result.current.isSuccess).toBe(false);
    expect(result.current.serverMessage).toEqual({
      title: "serverError.alreadyRegisteredTitle",
      description: "serverError.alreadyRegisteredDescription",
      variant: "destructive",
    });
  });

  it("deve mostrar cada mensagem do 422 no seu campo", async () => {
    vi.spyOn(cadastroService, "registerUser").mockRejectedValueOnce(
      new CadastroRequestError(
        "validation",
        "Validation error.",
        { codigoFuncionario: "Informe a matricula.", email: "Informe um e-mail valido." },
        []
      )
    );
    const { result } = renderHook(() => useCadastroVM());

    await fillAndSubmit(result);

    const { errors } = result.current.form.formState;
    expect(errors.codigoFuncionario?.message).toBe("Informe a matricula.");
    expect(errors.email?.message).toBe("Informe um e-mail valido.");
    expect(result.current.serverMessage).toEqual({
      title: "serverError.invalidFieldsTitle",
      description: undefined,
      variant: "destructive",
    });
  });

  it("deve levar ao aviso as mensagens do 422 sem campo no formulário", async () => {
    vi.spyOn(cadastroService, "registerUser").mockRejectedValueOnce(
      new CadastroRequestError(
        "validation",
        "Validation error.",
        { empresa: "Informe o orgao ou empresa." },
        ["Informe um perfil de jornada valido."]
      )
    );
    const { result } = renderHook(() => useCadastroVM());

    await fillAndSubmit(result);

    expect(result.current.form.formState.errors.empresa?.message).toBe(
      "Informe o orgao ou empresa."
    );
    expect(result.current.serverMessage?.description).toBe(
      "Informe um perfil de jornada valido."
    );
  });

  it("deve mostrar a mensagem geral nos demais erros", async () => {
    vi.spyOn(cadastroService, "registerUser").mockRejectedValueOnce(
      new CadastroRequestError("server_error", "Erro ao realizar cadastro do usuário.")
    );
    const { result } = renderHook(() => useCadastroVM());

    await fillAndSubmit(result);

    expect(result.current.serverMessage).toEqual({
      title: "serverError.serverErrorTitle",
      description: "serverError.serverErrorDescription",
      variant: "destructive",
    });
  });

  it("deve limpar a mensagem do servidor ao chamar onCloseMsg", async () => {
    vi.spyOn(cadastroService, "registerUser").mockRejectedValueOnce(new Error("Network Error"));
    const { result } = renderHook(() => useCadastroVM());

    await fillAndSubmit(result);

    expect(result.current.serverMessage).not.toBeNull();

    act(() => {
      result.current.onCloseMsg();
    });

    expect(result.current.serverMessage).toBeNull();
  });
});
