import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, LineChart } from 'lucide-react';

export default function BecomeAnExpert() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="container mx-auto px-4 py-12 flex-1">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <LineChart className="h-16 w-16 mx-auto mb-4 text-primary" />
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Become an Expert
            </h1>
            <p className="text-xl text-muted-foreground">
              Share your chart analysis, trading patterns, and market insights with the ToadToe community
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Contribute Your Analysis</CardTitle>
              <CardDescription>
                If you are an analyst, trader, or market enthusiast who wants to publish chart-based insights on ToadToe,
                we would love to hear from you.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">How to Get Started</h3>
                <p className="text-muted-foreground">
                  Send us an email with a brief introduction, your areas of expertise, and sample chart analyses you would
                  like to publish. Our editorial team will review your work and get back to you with next steps.
                </p>
              </div>

              <div className="pt-6 border-t border-border">
                <h3 className="text-lg font-semibold mb-3">Contact Email</h3>
                <p className="text-muted-foreground mb-4">
                  To become an expert contributor on ToadToe, write to us at:
                </p>
                <a
                  href="mailto:contact@toadtoe.com"
                  className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
                >
                  <Mail className="h-5 w-5" />
                  contact@toadtoe.com
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
