import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Search, Cloud, Sparkles } from "lucide-react";
import { useProjects } from "@/context/ProjectsContext";
import { TopNav } from "@/components/TopNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatsRow } from "@/components/dashboard/StatsRow";
import { ProjectCard } from "@/components/dashboard/ProjectCard";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Dashboard = () => {
  const { projects } = useProjects();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = useMemo(() => {
    return projects
      .filter((p) => {
        if (filter === "active") return p.stage !== "live";
        if (filter === "live") return p.stage === "live";
        return true;
      })
      .filter((p) =>
        query === ""
          ? true
          : p.name.toLowerCase().includes(query.toLowerCase()) ||
            p.owner.toLowerCase().includes(query.toLowerCase()) ||
            p.businessUnit.toLowerCase().includes(query.toLowerCase()),
      )
      .sort((a, b) => b.lastActivityAt - a.lastActivityAt);
  }, [projects, query, filter]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopNav />
      <main className="flex-1 px-6 py-8 max-w-7xl w-full mx-auto space-y-6">
        {/* Hero */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">CloudOps Onboarding Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">
              AI-driven onboarding for AWS, Azure & GCP — from idea to live infrastructure.
            </p>
          </div>
          <Button
            size="lg"
            className="gradient-primary text-primary-foreground"
            onClick={() => navigate("/onboarding/new")}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            New Onboarding
          </Button>
        </div>

        <StatsRow projects={projects} />

        {/* Hero CTA card */}
        <Link
          to="/onboarding/new"
          className="block bg-gradient-to-r from-primary/10 via-accent/10 to-primary/5 border border-accent/30 rounded-xl p-6 hover:shadow-card-hover transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl gradient-accent flex items-center justify-center shrink-0">
              <Sparkles className="h-6 w-6 text-accent-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Talk to Aria — your AI Solution Architect</h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                Just describe your project. Aria will recommend the right cloud, services, and provision everything end-to-end.
              </p>
            </div>
            <Button variant="outline" className="shrink-0 hidden sm:inline-flex">
              Start chat →
            </Button>
          </div>
        </Link>

        {/* Filters */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <Tabs value={filter} onValueChange={setFilter}>
            <TabsList>
              <TabsTrigger value="all">All ({projects.length})</TabsTrigger>
              <TabsTrigger value="active">Active ({projects.filter(p => p.stage !== "live").length})</TabsTrigger>
              <TabsTrigger value="live">Live ({projects.filter(p => p.stage === "live").length})</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="relative flex-1 max-w-sm">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, owner, BU…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <Cloud className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">No projects match your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
