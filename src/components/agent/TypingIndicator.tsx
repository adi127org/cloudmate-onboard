import { Bot } from "lucide-react";

export const TypingIndicator = () => (
  <div className="flex gap-3 justify-start">
    <div className="h-8 w-8 rounded-full gradient-accent flex items-center justify-center shrink-0">
      <Bot className="h-4 w-4 text-accent-foreground" />
    </div>
    <div className="bg-card border rounded-2xl rounded-tl-sm px-4 py-3 shadow-card">
      <div className="flex gap-1.5">
        <span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  </div>
);
