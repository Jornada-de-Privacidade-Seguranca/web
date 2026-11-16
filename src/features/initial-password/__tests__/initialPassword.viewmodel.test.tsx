// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

import * as invitationService from "@services/invitationService";
import { InvitationRequestError } from "@services/invitationService";
import type { InitialPasswordFormValues, InvitedUserResponse } from "../initialPassword.types";
import { useInitialPasswordVM } from "../initialPassword.viewmodel";

const { routerReplaceMock, searchState } = vi.hoisted(() => ({
  routerReplaceMock: vi.fn(),
  searchState: { value: "" },
}));

// As chaves de tradução resolvem para elas mesmas
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(searchState.value),
}));

vi.mock("@/shared/i18n/navigation", () => ({
  useRouter: () => ({ replace: routerReplaceMock }),
}));

const VALID_SEARCH = "email=ana%40exemplo.com&token=abc";

const validForm: InitialPasswordFormValues = {
  nomeCompleto: "Ana Souza",
  empresa: "Prefeitura Exemplo",
  departamento: "Tecnologia",
  codigoFuncionario: "00123456",
  senha: "senha-segura",
  confirmarSenha: "senha-segura",
};

const activatedUser: InvitedUserResponse = {
  id: 42,
  email: "ana@exemplo.com",
  user_type_id: null,
  profile_type_id: 3,
  active_status: 1,
  account_status: "active",
};

function createWrapper() {
  const queryClient = new QueryClient();
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

async function renderValidated() {
  const hook = renderHook(() => useInitialPasswordVM(), { wrapper: createWrapper() });
  await waitFor(() => expect(hook.result.current.status).toBe("ready"));
  return hook;
}

async function fillAndSubmit(
  result: { current: ReturnType<typeof useInitialPasswordVM> },
  values: InitialPasswordFormValues = validForm
) {
  act(() => {
    for (const [field, value] of Object.entries(values)) {
      result.current.form.setValue(field as keyof InitialPasswordFormValues, value);
    }
  });
  await act(async () => {
    await result.current.handleSubmit();
  });
}

describe("useInitialPasswordVM", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    routerReplaceMock.mockClear();
    searchState.value = VALID_SEARCH;
  });

  describe("validação do link", () => {
    it("deve mostrar o link inválido sem e-mail ou código, sem chamar a API", () => {
      const spy = vi.spyOn(invitationService, "validateInvitation");

      for (const search of ["", "email=ana%40exemplo.com", "token=abc", "email=&token=abc"]) {
        searchState.value = search;
        const { result } = renderHook(() => useInitialPasswordVM(), { wrapper: createWrapper() });
        expect(result.current.status).toBe("invalid");
      }
      expect(spy).not.toHaveBeenCalled();
    });

    it("deve validar o convite do link e mostrar o carregamento enquanto isso", async () => {
      const spy = vi
        .spyOn(invitationService, "validateInvitation")
        .mockResolvedValue({ email: "ana@exemplo.com", is_valid: true });

      const { result } = renderHook(() => useInitialPasswordVM(), { wrapper: createWrapper() });
      expect(result.current.status).toBe("validating");

      await waitFor(() => expect(result.current.status).toBe("ready"));
      expect(spy).toHaveBeenCalledWith({ email: "ana@exemplo.com", token: "abc" });
      expect(result.current.email).toBe("ana@exemplo.com");
    });

    it("deve mostrar o link inválido para convite inválido, expirado ou já usado", async () => {
      vi.spyOn(invitationService, "validateInvitation").mockRejectedValue(
        new InvitationRequestError("invalid_invitation", "O convite e invalido.")
      );

      const { result } = renderHook(() => useInitialPasswordVM(), { wrapper: createWrapper() });

      await waitFor(() => expect(result.current.status).toBe("invalid"));
    });

    it("deve permitir tentar de novo quando a validação falhar por outro motivo", async () => {
      const spy = vi
        .spyOn(invitationService, "validateInvitation")
        .mockRejectedValueOnce(new InvitationRequestError("server_error", "Erro interno."))
        .mockResolvedValueOnce({ email: "ana@exemplo.com", is_valid: true });

      const { result } = renderHook(() => useInitialPasswordVM(), { wrapper: createWrapper() });
      await waitFor(() => expect(result.current.status).toBe("validation_failed"));

      act(() => result.current.handleRetry());

      await waitFor(() => expect(result.current.status).toBe("ready"));
      expect(spy).toHaveBeenCalledTimes(2);
    });

    it("deve avisar muitas tentativas quando a validação responde 429", async () => {
      vi.spyOn(invitationService, "validateInvitation").mockRejectedValue(
        new InvitationRequestError("too_many_requests", "Muitas tentativas.")
      );

      const { result } = renderHook(() => useInitialPasswordVM(), { wrapper: createWrapper() });

      await waitFor(() => expect(result.current.status).toBe("validation_failed"));
      expect(result.current.labels.validationFailed).toBe("tooManyAttempts");
    });
  });

  describe("formulário", () => {
    beforeEach(() => {
      vi.spyOn(invitationService, "validateInvitation").mockResolvedValue({
        email: "ana@exemplo.com",
        is_valid: true,
      });
    });

    it("deve exigir os campos com as mensagens do cadastro, sem enviar", async () => {
      const spy = vi.spyOn(invitationService, "completeInvitation");
      const { result } = await renderValidated();

      await act(async () => {
        await result.current.handleSubmit();
      });

      const errors = result.current.form.formState.errors;
      expect(errors.nomeCompleto?.message).toBe("validation.fullNameRequired");
      expect(errors.empresa?.message).toBe("validation.companyRequired");
      expect(errors.departamento?.message).toBe("validation.departmentRequired");
      expect(errors.codigoFuncionario?.message).toBe("validation.employeeCodeRequired");
      expect(errors.senha?.message).toBe("validation.passwordRequired");
      expect(errors.confirmarSenha?.message).toBe("validation.confirmPasswordRequired");
      expect(spy).not.toHaveBeenCalled();
    });

    it("deve aplicar as regras do cadastro ao nome e à confirmação de senha", async () => {
      const spy = vi.spyOn(invitationService, "completeInvitation");
      const { result } = await renderValidated();

      await fillAndSubmit(result, { ...validForm, nomeCompleto: "Ana", confirmarSenha: "outra-senha" });

      const errors = result.current.form.formState.errors;
      expect(errors.nomeCompleto?.message).toBe("validation.fullNameLastName");
      expect(errors.confirmarSenha?.message).toBe("validation.passwordsDoNotMatch");
      expect(spy).not.toHaveBeenCalled();
    });

    it("deve ativar a conta e levar ao login com o aviso de conta ativada", async () => {
      const spy = vi
        .spyOn(invitationService, "completeInvitation")
        .mockResolvedValueOnce(activatedUser);
      const { result } = await renderValidated();

      await fillAndSubmit(result);

      expect(spy).toHaveBeenCalledWith({ email: "ana@exemplo.com", token: "abc" }, validForm);
      // O destino não leva o código nem a senha
      expect(routerReplaceMock).toHaveBeenCalledWith("/login?reason=account_activated");
      expect(result.current.isSubmitting).toBe(true);
    });

    it("deve mostrar o link inválido quando o convite expira no envio", async () => {
      vi.spyOn(invitationService, "completeInvitation").mockRejectedValueOnce(
        new InvitationRequestError("invalid_invitation", "O convite e invalido.")
      );
      const { result } = await renderValidated();

      await fillAndSubmit(result);

      expect(result.current.status).toBe("invalid");
      expect(routerReplaceMock).not.toHaveBeenCalled();
    });

    it("deve mostrar os erros do 422 em cada campo", async () => {
      vi.spyOn(invitationService, "completeInvitation").mockRejectedValueOnce(
        new InvitationRequestError("validation", "Validation error.", {
          nomeCompleto: "Informe nome e sobrenome.",
          codigoFuncionario: "A matrícula deve ter no máximo 50 caracteres.",
        })
      );
      const { result } = await renderValidated();

      await fillAndSubmit(result);

      const errors = result.current.form.formState.errors;
      expect(errors.nomeCompleto?.message).toBe("Informe nome e sobrenome.");
      expect(errors.codigoFuncionario?.message).toBe("A matrícula deve ter no máximo 50 caracteres.");
      expect(result.current.serverMessage).toBeNull();
      expect(result.current.status).toBe("ready");
    });

    it("deve mostrar no aviso as mensagens de campos fora do formulário", async () => {
      vi.spyOn(invitationService, "completeInvitation").mockRejectedValueOnce(
        new InvitationRequestError("validation", "Validation error.", {}, ["Campo fora do formulário."])
      );
      const { result } = await renderValidated();

      await fillAndSubmit(result);

      expect(result.current.serverMessage).toEqual({
        title: "submitError",
        description: "Campo fora do formulário.",
        variant: "destructive",
      });
    });

    it("deve avisar muitas tentativas quando o envio responde 429", async () => {
      vi.spyOn(invitationService, "completeInvitation").mockRejectedValueOnce(
        new InvitationRequestError("too_many_requests", "Muitas tentativas.")
      );
      const { result } = await renderValidated();

      await fillAndSubmit(result);

      expect(result.current.serverMessage).toEqual({
        title: "tooManyAttempts",
        variant: "destructive",
      });
    });

    it("deve mostrar a mensagem genérica em outras falhas", async () => {
      vi.spyOn(invitationService, "completeInvitation").mockRejectedValueOnce(
        new InvitationRequestError("server_error", "Erro interno.")
      );
      const { result } = await renderValidated();

      await fillAndSubmit(result);

      expect(result.current.serverMessage).toEqual({ title: "submitError", variant: "destructive" });
      expect(result.current.isSubmitting).toBe(false);

      act(() => result.current.onCloseMsg());
      expect(result.current.serverMessage).toBeNull();
    });
  });
});
