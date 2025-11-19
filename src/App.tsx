import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
import Index from "./pages/Index";
import ArticleDetail from "./pages/ArticleDetail";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import ArticleEditor from "./pages/ArticleEditor";
import SectionArticles from "./pages/SectionArticles";
import AdvertiseWithUs from "./pages/AdvertiseWithUs";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/article/:slug" element={<ArticleDetail />} />
            <Route path="/section/:sectionId" element={<SectionArticles />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/editor" element={<ArticleEditor />} />
            <Route path="/admin/editor/:id" element={<ArticleEditor />} />
            <Route path="/advertise" element={<AdvertiseWithUs />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
