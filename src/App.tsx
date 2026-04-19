import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProjectsProvider } from "@/context/ProjectsContext";
import Dashboard from "./pages/Dashboard.tsx";
import NewOnboarding from "./pages/NewOnboarding.tsx";
import ProjectWorkspace from "./pages/ProjectWorkspace.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ProjectsProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/onboarding/new" element={<NewOnboarding />} />
            <Route path="/onboarding/:id" element={<ProjectWorkspace />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ProjectsProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
