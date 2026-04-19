import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProjects } from "@/context/ProjectsContext";
import { TopNav } from "@/components/TopNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatBubble } from "@/components/agent/ChatBubble";
import { TypingIndicator } from "@/components/agent/TypingIndicator";
import { SuggestedReplies } from "@/components/agent/SuggestedReplies";
import { AgentNotebookPanel } from "@/components/agent/AgentNotebook";
import { ChatMessage } from "@/types/project";
import { detectFromAnswer, FIRST_TURN, getNextAgentTurn } from "@/lib/agentScript";
import { generateRecommendation } from "@/lib/recommendationEngine";
import { ArrowLeft, Send, Sparkles } from "lucide-react";

const NewOnboarding = () => {
  const navigate = useNavigate();
  const { createProject, appendChat, updateNotebook, lockChat, setRecommendation } = useProjects();

  const [projectId] = useState(() => {
    const p = createProject({
      name: "New Onboarding",
      owner: "Admin User",
      empId: "TCS-000001",
      businessUnit: "Pending",
    });
    return p.id;
  });

  const { getProject } = useProjects();
  const project = getProject(projectId);

  const [turnIndex, setTurnIndex] = useState(0);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [done, setDone] = useState(false);
  const [currentSuggestions, setCurrentSuggestions] = useState<string[] | undefined>(undefined);
  const scrollRef = useRef<HTMLDivElement>(null);
  const initialised = useRef(false);

  // Send initial agent turn once
  useEffect(() => {
    if (initialised.current) return;
    initialised.current = true;
    const first = getNextAgentTurn(0)!;
    appendChat(projectId, { ...FIRST_TURN, content: first.message });
    setCurrentSuggestions(first.suggestions);
    setTurnIndex(0);
  }, [appendChat, projectId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [project?.chat.length, typing]);

  const handleSend = (text: string) => {
    if (!text.trim() || typing || done) return;
    const currentTurn = getNextAgentTurn(turnIndex);

    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", content: text.trim(), ts: Date.now() };
    appendChat(projectId, userMsg);
    setInput("");
    setCurrentSuggestions(undefined);

    // Update notebook from answer
    if (currentTurn?.field) {
      const patch = detectFromAnswer(currentTurn.field, text.trim(), project?.notebook ?? {});
      updateNotebook(projectId, patch);
      if (currentTurn.field === "projectName") {
        // also rename project
        // (we leave updateNotebook to handle projectName; project name updates indirectly via card)
      }
    }

    setTyping(true);
    const nextIdx = turnIndex + 1;
    const nextTurn = getNextAgentTurn(nextIdx);
    if (!nextTurn) {
      setTimeout(() => {
        setTyping(false);
        setDone(true);
      }, 800);
      return;
    }

    setTimeout(() => {
      appendChat(projectId, {
        id: crypto.randomUUID(),
        role: "agent",
        content: nextTurn.message,
        ts: Date.now(),
      });
      setCurrentSuggestions(nextTurn.suggestions);
      setTurnIndex(nextIdx);
      if (nextTurn.done) setDone(true);
      setTyping(false);
    }, 1100 + Math.random() * 600);
  };

  const handleGenerate = () => {
    if (!project) return;
    const rec = generateRecommendation(project.notebook);
    setRecommendation(projectId, rec);
    lockChat(projectId);
    navigate(`/onboarding/${projectId}?tab=recommendations`);
  };

  if (!project) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopNav />
      <div className="border-b bg-card px-6 py-3 flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Dashboard
        </Button>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent" />
            Discovery — chat with Aria
          </h2>
          <p className="text-[11px] text-muted-foreground">
            Aria will gather everything needed to draft your cloud blueprint.
          </p>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_360px] overflow-hidden">
        {/* Chat */}
        <div className="flex flex-col h-[calc(100vh-7rem)] lg:h-auto">
          <div ref={scrollRef} className="flex-1 overflow-auto px-4 lg:px-8 py-6 space-y-4 bg-muted/30">
            {project.chat.map((m) => (
              <ChatBubble key={m.id} message={m} />
            ))}
            {typing && <TypingIndicator />}
          </div>

          {/* Composer */}
          <div className="border-t bg-card p-4 space-y-3">
            {currentSuggestions && currentSuggestions.length > 0 && !typing && (
              <SuggestedReplies suggestions={currentSuggestions} onPick={handleSend} />
            )}
            {done ? (
              <Button
                size="lg"
                className="w-full gradient-accent text-accent-foreground"
                onClick={handleGenerate}
              >
                <Sparkles className="h-4 w-4 mr-1.5" />
                Generate Recommendation
              </Button>
            ) : (
              <form
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend(input);
                }}
              >
                <Input
                  placeholder="Type your reply…"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={typing}
                  autoFocus
                />
                <Button type="submit" disabled={!input.trim() || typing} size="icon" className="shrink-0">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            )}
          </div>
        </div>

        {/* Notebook */}
        <div className="hidden lg:block">
          <AgentNotebookPanel notebook={project.notebook} />
        </div>
      </div>
    </div>
  );
};

export default NewOnboarding;
