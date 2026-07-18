import * as React from "react";

import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";

type MessageVariant =
  | "default"
  | "info"
  | "success"
  | "warning"
  | "destructive";

const messageVariants = cva(
  "w-full rounded-xl border px-4 py-3 text-left shadow-sm",
  {
    variants: {
      variant: {
        default: "border-border bg-card text-card-foreground",
        info: "border-primary/20 bg-primary/10 text-foreground",
        success: "border-success/20 bg-success/10 text-success",
        warning: "border-warning/20 bg-warning/10 text-warning",
        destructive: "border-destructive/20 bg-destructive/10 text-destructive",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  },
);

const iconVariants = cva(
  "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
  {
    variants: {
      variant: {
        default: "bg-muted text-foreground",
        info: "bg-primary/15 text-primary",
        success: "bg-success/15 text-success",
        warning: "bg-warning/15 text-warning",
        destructive: "bg-destructive/15 text-destructive",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  },
);

const closeButtonVariants = cva(
  "rounded-full p-1 flex items-center justify-center size-8 text-muted-foreground hover:cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-foreground/10   hover:bg-foreground/30 text-foreground",
        info: "bg-primary/15  hover:bg-primary/30 text-primary",
        success: "bg-success/15  hover:bg-success/30 text-success",
        warning: "bg-warning/15  hover:bg-warning/30 text-warning",
        destructive:
          "bg-destructive/15  hover:bg-destructive/30 text-destructive",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  },
);

interface MessageProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  variant?: MessageVariant;
  onClose?: () => void;
}

function Message({
  title,
  description,
  icon,
  variant = "default",
  className,
  onClose,
  ...props
}: MessageProps) {
  return (
    <div
      role={variant === "destructive" ? "alert" : "status"}
      className={cn(messageVariants({ variant, className }))}
      {...props}
    >
      <div className="flex items-center gap-3">
        {icon && (
          <div className={cn(iconVariants({ variant, className }))}>{icon}</div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-5">{title}</p>
          {description ? (
            <p className="mt-1 text-sm leading-5 opacity-90">{description}</p>
          ) : null}
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className={cn(closeButtonVariants({ variant, className }))}
          >
            <span className="sr-only">Close</span>
            <HugeiconsIcon icon={Cancel01Icon} />
          </button>
        )}
      </div>
    </div>
  );
}

export { Message };
export type { MessageProps, MessageVariant };
