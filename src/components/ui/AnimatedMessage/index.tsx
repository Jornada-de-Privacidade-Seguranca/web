"use client";

import { cn } from "@/shared/lib/utils";
import { Message } from "../message";
import { useAnimatedMessageVM } from "./animatedMessage.viewmodel";
import type { AnimatedMessageProps } from "./animatedMessage.types";

/**
 * Aviso que entra deslizando e some recolhendo a altura, sem saltos no layout.
 * Sem movimento para quem prefere menos animação (prefers-reduced-motion).
 */
export function AnimatedMessage(props: AnimatedMessageProps) {
  const { displayedMessage, messageKey, isOpen, onClose, handleTransitionEnd } =
    useAnimatedMessageVM(props);

  if (!displayedMessage) return null;

  return (
    <div
      data-state={isOpen ? "open" : "closed"}
      inert={!isOpen}
      onTransitionEnd={handleTransitionEnd}
      className={cn(
        // Com menos animação, a transição dura 1 ms em vez de não existir: sem
        // ela, o transitionend não dispara e o aviso fechado não sai da tela
        "grid w-full transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:duration-[1ms]",
        isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
      )}
    >
      <div className="min-h-0 overflow-hidden">
        <div
          key={messageKey}
          className={cn(
            "animate-in fade-in-0 slide-in-from-top-2 duration-300 motion-reduce:animate-none",
            props.className
          )}
        >
          <Message
            title={displayedMessage.title}
            description={displayedMessage.description}
            icon={displayedMessage.icon}
            variant={displayedMessage.variant}
            onClose={onClose}
          />
        </div>
      </div>
    </div>
  );
}
