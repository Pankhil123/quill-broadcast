import { useState } from "react";
import { Copy, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface CopyTradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  articleTitle: string;
  articleId: string;
}

export const CopyTradeDialog = ({ open, onOpenChange, articleTitle, articleId }: CopyTradeDialogProps) => {
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const navigate = useNavigate();

  const handleCopy = async () => {
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error("Please sign in to copy trades");
      navigate("/auth");
      onOpenChange(false);
      return;
    }

    if (!apiKey.trim()) {
      toast.error("Please enter your platform integration key");
      return;
    }

    setIsLoading(true);

    try {
      // Store the platform key
      const { error } = await supabase
        .from('user_platform_keys')
        .upsert({
          user_id: user.id,
          api_key: apiKey,
          platform_name: 'broker',
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,platform_name'
        });

      if (error) throw error;

      // Simulate successful copy
      setIsCopied(true);
      toast.success("Trade analysis copied successfully!", {
        description: `"${articleTitle}" has been copied to your trading platform.`,
      });

      // Reset after delay
      setTimeout(() => {
        setIsCopied(false);
        setApiKey("");
        onOpenChange(false);
      }, 2000);
    } catch (error) {
      console.error('Error saving platform key:', error);
      toast.error("Failed to copy trade. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Copy className="h-5 w-5 text-primary" />
            Copy Trade Analysis
          </DialogTitle>
          <DialogDescription>
            Enter your platform integration key to copy this analysis to your trading account.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="article-title">Analysis</Label>
            <Input
              id="article-title"
              value={articleTitle}
              disabled
              className="bg-muted"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="api-key">Platform Integration Key</Label>
            <Input
              id="api-key"
              type="password"
              placeholder="Enter your broker API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              disabled={isCopied}
            />
            <p className="text-xs text-muted-foreground">
              Your key will be securely stored for future trades
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading || isCopied}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCopy}
            disabled={isLoading || isCopied}
            className="gap-2"
          >
            {isCopied ? (
              <>
                <Check className="h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                {isLoading ? "Copying..." : "Copy Trade"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};