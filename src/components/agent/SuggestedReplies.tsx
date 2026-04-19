import { Button } from "@/components/ui/button";

interface Props {
  suggestions: string[];
  onPick: (s: string) => void;
}

export const SuggestedReplies = ({ suggestions, onPick }: Props) => (
  <div className="flex flex-wrap gap-2">
    {suggestions.map((s) => (
      <Button key={s} variant="outline" size="sm" className="rounded-full text-xs h-8 border-accent/30 hover:bg-accent/10 hover:text-accent-foreground" onClick={() => onPick(s)}>
        {s}
      </Button>
    ))}
  </div>
);
