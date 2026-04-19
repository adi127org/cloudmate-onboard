import { ChatMessage } from "@/types/project";
import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";

const renderInline = (text: string) => {
  // very small markdown-ish bold + line breaks
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? (
      <strong key={i}>{p.slice(2, -2)}</strong>
    ) : (
      <span key={i}>{p}</span>
    ),
  );
};

export const ChatBubble = ({ message }: { message: ChatMessage }) => {
  const isAgent = message.role === "agent";
  return (
    <div className={cn("flex gap-3", isAgent ? "justify-start" : "justify-end")}>
      {isAgent && (
        <div className="h-8 w-8 rounded-full gradient-accent flex items-center justify-center shrink-0">
          <Bot className="h-4 w-4 text-accent-foreground" />
        </div>
      )}
      <div
        className={cn(
          "max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-card whitespace-pre-wrap",
          isAgent ? "bg-card border rounded-tl-sm" : "bg-primary text-primary-foreground rounded-tr-sm",
        )}
      >
        {isAgent && <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Aria · Solution Architect</div>}
        <div>{renderInline(message.content)}</div>
      </div>
      {!isAgent && (
        <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
          <User className="h-4 w-4 text-secondary-foreground" />
        </div>
      )}
    </div>
  );
};
