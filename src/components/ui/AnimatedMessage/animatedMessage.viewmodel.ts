"use client";

import { useState, type TransitionEvent } from "react";
import type {
  AnimatedMessageContent,
  AnimatedMessageProps,
  AnimatedMessageViewModelReturn,
} from "./animatedMessage.types";

function getMessageKey(message: AnimatedMessageContent | null): string {
  if (!message) return "";
  return [message.variant ?? "", message.title, message.description ?? ""].join("|");
}

export function useAnimatedMessageVM({
  message,
  onClose,
}: AnimatedMessageProps): AnimatedMessageViewModelReturn {
  const [displayedMessage, setDisplayedMessage] = useState(message);

  // Guarda a última mensagem durante a renderização (padrão do React para
  // derivar estado de props): ao receber `null`, o conteúdo continua na tela
  // até a animação de saída terminar
  if (message && getMessageKey(message) !== getMessageKey(displayedMessage)) {
    setDisplayedMessage(message);
  }

  function handleTransitionEnd(event: TransitionEvent<HTMLElement>) {
    // Só a transição do próprio contêiner; a do conteúdo interno não fecha o aviso
    if (event.target !== event.currentTarget) return;
    if (!message) {
      setDisplayedMessage(null);
    }
  }

  return {
    displayedMessage,
    messageKey: getMessageKey(displayedMessage),
    isOpen: message !== null,
    onClose,
    handleTransitionEnd,
  };
}
