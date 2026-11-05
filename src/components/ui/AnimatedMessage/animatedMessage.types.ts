import type { ReactNode, TransitionEvent } from "react";
import type { MessageVariant } from "../message";

export interface AnimatedMessageContent {
  title: string;
  description?: string;
  icon?: ReactNode;
  variant?: MessageVariant;
}

export interface AnimatedMessageProps {
  /** Mensagem a exibir; `null` fecha o aviso com animação. */
  message: AnimatedMessageContent | null;
  onClose?: () => void;
  /** Classes do conteúdo (por exemplo, o espaçamento acima do aviso). */
  className?: string;
}

export interface AnimatedMessageViewModelReturn {
  /** Última mensagem exibida, mantida durante a animação de saída. */
  displayedMessage: AnimatedMessageContent | null;
  /** Chave da mensagem: muda a cada mensagem nova, para repetir a animação de entrada. */
  messageKey: string;
  isOpen: boolean;
  onClose?: () => void;
  /** Ao fim da animação de saída, desmonta o conteúdo. */
  handleTransitionEnd: (event: TransitionEvent<HTMLElement>) => void;
}
