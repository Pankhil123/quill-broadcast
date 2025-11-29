import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, X, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const MarketDataWidget = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [marketData, setMarketData] = useState<any>(null);
  const [symbol] = useState("MSFT");

  const fetchMarketData = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('alpha-vantage', {
        body: { symbol },
      });

      if (error) throw error;
      
      setMarketData(data);
    } catch (error) {
      console.error('Error fetching market data:', error);
      toast.error('Failed to fetch market data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
    // Refresh every 5 minutes
    const interval = setInterval(fetchMarketData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [symbol]);

  if (!isVisible) return null;

  const getLatestPrice = () => {
    if (!marketData?.["Time Series (5min)"]) return null;
    const timeSeries = marketData["Time Series (5min)"];
    const latestTime = Object.keys(timeSeries)[0];
    return timeSeries[latestTime];
  };

  const latestPrice = getLatestPrice();
  const currentPrice = latestPrice?.["4. close"];
  const previousPrice = latestPrice?.["1. open"];
  const priceChange = currentPrice && previousPrice ? 
    ((parseFloat(currentPrice) - parseFloat(previousPrice)) / parseFloat(previousPrice) * 100).toFixed(2) : null;
  const isPositive = priceChange && parseFloat(priceChange) > 0;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className="w-80 shadow-lg border-border bg-card">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Live Market Data
          </CardTitle>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={fetchMarketData}
              disabled={isLoading}
            >
              <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setIsVisible(false)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading && !marketData ? (
            <div className="text-center py-4 text-muted-foreground text-sm">
              Loading market data...
            </div>
          ) : marketData ? (
            <>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-lg">{symbol}</span>
                {currentPrice && (
                  <span className="text-2xl font-bold">
                    ${parseFloat(currentPrice).toFixed(2)}
                  </span>
                )}
              </div>
              {priceChange && (
                <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  <span className="font-medium">{isPositive ? '+' : ''}{priceChange}%</span>
                </div>
              )}
              <div className="text-xs text-muted-foreground border-t pt-2 mt-2">
                Data updates every 5 minutes
              </div>
            </>
          ) : (
            <div className="text-center py-4 text-muted-foreground text-sm">
              Unable to load market data
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};