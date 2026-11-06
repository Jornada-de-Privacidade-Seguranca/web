import { describe, it, expect, vi } from "vitest";
import { useInactiveUserBannerVM } from "../inactiveUserBanner.viewmodel";
import type { InactiveUserBannerProps } from "../inactiveUserBanner.types";
import type { AdminUserDetailLabels } from "../../../adminUserDetail.types";

describe("useInactiveUserBannerVM", () => {
  const mockLabels = {
    bannerTitle: "Usuário Inativo",
    bannerDescription: "Conta desativada",
    bannerActivateNow: "Ativar agora",
    bannerDismiss: "Fechar",
    bannerDontShowAgain: "Não mostrar novamente",
  } as AdminUserDetailLabels;

  it("deve repassar handlers e labels do banner", () => {
    const onActivateMock = vi.fn();
    const onDismissMock = vi.fn();
    const onDontShowAgainMock = vi.fn();

    const props: InactiveUserBannerProps = {
      isVisible: true,
      labels: mockLabels,
      onActivateNow: onActivateMock,
      onDismiss: onDismissMock,
      onDontShowAgain: onDontShowAgainMock,
    };

    const vm = useInactiveUserBannerVM(props);

    expect(vm.isVisible).toBe(true);
    expect(vm.title).toBe("Usuário Inativo");

    vm.onActivateNow();
    expect(onActivateMock).toHaveBeenCalled();

    vm.onDismiss();
    expect(onDismissMock).toHaveBeenCalled();

    vm.onDontShowAgain();
    expect(onDontShowAgainMock).toHaveBeenCalled();
  });
});
