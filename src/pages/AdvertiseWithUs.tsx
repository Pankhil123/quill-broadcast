import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Megaphone } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdvertiseWithUs() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="container mx-auto px-4 py-12 flex-1">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <Megaphone className="h-16 w-16 mx-auto mb-4 text-primary" />
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Advertise With Us
            </h1>
            <p className="text-xl text-muted-foreground">
              Reach a highly engaged audience interested in financial markets and trading patterns
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Partner with ToadToe</CardTitle>
              <CardDescription>
                Connect with traders, investors, and financial enthusiasts who trust our pattern analysis and market insights
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Advertising Opportunities</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Banner advertisements across all pages</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Sponsored articles with native integration</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Section-specific targeting (Commodities, Cryptocurrencies, Indices, Equities)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Hero banners and interstitial placements</span>
                  </li>
                </ul>
              </div>

              <div className="pt-6 border-t border-border">
                <h3 className="text-lg font-semibold mb-3">Get in Touch</h3>
                <p className="text-muted-foreground mb-4">
                  For advertising inquiries, rates, and availability, please contact our team:
                </p>
                <Button asChild size="lg">
                  <a href="mailto:contact@toadtoe.com" className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    contact@toadtoe.com
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
