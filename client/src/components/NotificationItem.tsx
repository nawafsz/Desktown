import { cn } from "@/lib/utils";

interface NotificationItemProps {
  id: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  onClick?: () => void;
}

export function NotificationItem({ id, title, message, time, isRead, onClick }: NotificationItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-3 rounded-md hover-elevate",
        !isRead && "bg-primary/5"
      )}
      data-testid={`notification-${id}`}
    >
      <div className="flex items-start gap-2">
        {!isRead && (
          <span className="mt-1.5 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
        )}
        <div className={cn("flex-1 min-w-0", isRead && "ml-4")}>
          <p className={cn("text-sm font-medium truncate", !isRead && "text-foreground")}>
            {title}
          </p>
          <p className="text-sm text-muted-foreground truncate mt-0.5">{message}</p>
          <p className="text-xs text-muted-foreground mt-1">{time}</p>
        </div>
      </div>
    </button>
  );
}
