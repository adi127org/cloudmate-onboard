import { Cloud, Bell, User, HelpCircle } from "lucide-react";
import { Button } from "./ui/button";

export const TopNav = () => {
  return (
    <header className="gradient-nav h-14 flex items-center px-6 justify-between shrink-0">
      <div className="flex items-center gap-3">
        <Cloud className="h-6 w-6 text-nav-foreground" />
        <div>
          <h1 className="text-sm font-semibold text-nav-foreground leading-tight">
            DIS Cloud Onboarding
          </h1>
          <p className="text-[10px] text-nav-foreground/60">
            Digital Infrastructure Services — Automation Platform
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="text-nav-foreground/70 hover:text-nav-foreground hover:bg-nav-foreground/10">
          <HelpCircle className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="text-nav-foreground/70 hover:text-nav-foreground hover:bg-nav-foreground/10 relative">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
        </Button>
        <Button variant="ghost" size="sm" className="text-nav-foreground/70 hover:text-nav-foreground hover:bg-nav-foreground/10 ml-2 gap-2">
          <User className="h-4 w-4" />
          <span className="text-xs">Admin</span>
        </Button>
      </div>
    </header>
  );
};
