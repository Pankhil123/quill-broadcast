import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Download, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const EMAIL_TEMPLATE_HTML = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        line-height: 1.7;
        color: #1f2937;
        margin: 0;
        padding: 0;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }
      .wrapper {
        max-width: 650px;
        margin: 40px auto;
        background: white;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      }
      .hero {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 48px 32px;
        text-align: center;
        color: white;
      }
      .hero-icon {
        width: 80px;
        height: 80px;
        background: rgba(255,255,255,0.2);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 20px;
        font-size: 40px;
        backdrop-filter: blur(10px);
      }
      .hero h1 {
        margin: 0 0 12px;
        font-size: 32px;
        font-weight: 700;
        text-shadow: 0 2px 4px rgba(0,0,0,0.2);
      }
      .hero p {
        margin: 0;
        font-size: 18px;
        opacity: 0.95;
      }
      .content {
        padding: 48px 40px;
      }
      .intro-text {
        font-size: 18px;
        color: #4b5563;
        font-style: italic;
        background: linear-gradient(to right, #f3f4f6, #e5e7eb);
        padding: 24px;
        border-left: 4px solid #667eea;
        border-radius: 8px;
        margin-bottom: 32px;
      }
      h2 {
        color: #111827;
        font-size: 24px;
        margin: 32px 0 20px;
        font-weight: 700;
      }
      .feature-grid {
        display: grid;
        gap: 16px;
        margin: 24px 0;
      }
      .feature-card {
        background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
        padding: 20px;
        border-radius: 12px;
        border-left: 4px solid #667eea;
        transition: transform 0.2s;
      }
      .feature-card:hover {
        transform: translateX(4px);
      }
      .feature-icon {
        display: inline-block;
        width: 32px;
        height: 32px;
        background: #667eea;
        color: white;
        border-radius: 8px;
        text-align: center;
        line-height: 32px;
        margin-right: 12px;
        font-size: 18px;
      }
      .feature-title {
        font-weight: 600;
        color: #111827;
        font-size: 16px;
      }
      .cta-section {
        text-align: center;
        margin: 40px 0;
        padding: 32px;
        background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
        border-radius: 12px;
      }
      .cta-button {
        display: inline-block;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 16px 48px;
        text-decoration: none;
        border-radius: 50px;
        font-weight: 700;
        font-size: 18px;
        box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
        transition: all 0.3s;
        margin-top: 16px;
      }
      .cta-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 15px 35px rgba(102, 126, 234, 0.5);
      }
      .image-banner {
        margin: 32px 0;
        border-radius: 12px;
        overflow: hidden;
      }
      .image-banner img {
        width: 100%;
        height: auto;
        display: block;
      }
      .benefits {
        background: #f9fafb;
        padding: 32px;
        border-radius: 12px;
        margin: 32px 0;
      }
      .benefits ul {
        list-style: none;
        padding: 0;
        margin: 16px 0 0;
      }
      .benefits li {
        padding: 12px 0;
        padding-left: 32px;
        position: relative;
        color: #374151;
      }
      .benefits li:before {
        content: "✓";
        position: absolute;
        left: 0;
        color: #10b981;
        font-weight: bold;
        font-size: 20px;
        width: 24px;
        height: 24px;
        background: #d1fae5;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        line-height: 1;
      }
      .footer {
        background: #111827;
        color: #9ca3af;
        padding: 32px 40px;
        text-align: center;
      }
      .footer-logo {
        color: #fff;
        font-size: 24px;
        font-weight: 700;
        margin-bottom: 16px;
      }
      .footer p {
        margin: 8px 0;
        font-size: 14px;
      }
      .footer a {
        color: #667eea;
        text-decoration: none;
      }
    </style>
  </head>
  <body>
    <div class="wrapper">
      <div class="hero">
        <div class="hero-icon">📊</div>
        <h1>Welcome to ToadToe</h1>
        <p>Your Trading Intelligence Platform</p>
      </div>

      <div class="content">
        <div class="intro-text">
          Imagine a place where every trader's perspective becomes a learning opportunity — where chart patterns, market notes, and personal analysis come together to create a living library of ideas.
        </div>

        <h2>Welcome to ToadToe</h2>
        <p>Here, you can upload your own chart patterns, share your technical analysis, and explore insights from traders who think just as deeply as you do. Whether it's a breakout setup you spotted, a harmonic pattern you're testing, or a clean support-resistance play, this is the space to document it, refine it, and learn from others doing the same.</p>

        <div class="image-banner">
          <img src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=650&h=300&fit=crop" alt="Trading Charts" />
        </div>

        <h2>Inside the portal, you'll be able to:</h2>
        <div class="feature-grid">
          <div class="feature-card">
            <span class="feature-icon">📁</span>
            <span class="feature-title">Upload and organize your chart patterns with ease</span>
          </div>
          <div class="feature-card">
            <span class="feature-icon">🏷️</span>
            <span class="feature-title">Tag and categorize setups for future reference</span>
          </div>
          <div class="feature-card">
            <span class="feature-icon">🤝</span>
            <span class="feature-title">Learn from a community of traders sharing real, thoughtful analysis</span>
          </div>
          <div class="feature-card">
            <span class="feature-icon">💾</span>
            <span class="feature-title">Build your own personal archive of trading ideas</span>
          </div>
          <div class="feature-card">
            <span class="feature-icon">🔍</span>
            <span class="feature-title">Discover recurring patterns in your approach over time</span>
          </div>
        </div>

        <div class="benefits">
          <h2 style="margin-top: 0;">Why Join ToadToe?</h2>
          <ul>
            <li>Access a repository of collective trading insight</li>
            <li>Sharpen your analytical edge with real market examples</li>
            <li>Grow as a trader by observing markets through many lenses</li>
            <li>Build your personal trading knowledge base</li>
            <li>Connect with like-minded analytical traders</li>
          </ul>
        </div>

        <div class="cta-section">
          <h2 style="margin-top: 0; color: #92400e;">Ready to Begin Your Journey?</h2>
          <p style="color: #78350f; font-size: 16px;">Join our community and start building your trading intelligence today.</p>
          <a href="https://www.toadtoe.online/" class="cta-button">Get Started Now</a>
        </div>

        <p style="text-align: center; font-size: 18px; color: #6b7280; margin-top: 32px;">
          We're excited to see what you'll create, share, and discover.
        </p>
        <p style="text-align: center; font-size: 20px; font-weight: 600; color: #111827;">
          See you inside.
        </p>
      </div>

      <div class="footer">
        <div class="footer-logo">ToadToe</div>
        <p>Your Gateway to Financial Market Intelligence</p>
        <p>Questions? Reach us at <a href="mailto:contact@toadtoe.online">contact@toadtoe.online</a></p>
        <p style="margin-top: 24px; font-size: 12px;">© ${new Date().getFullYear()} ToadToe. All rights reserved.</p>
      </div>
    </div>
  </body>
</html>`;

export function EmailTemplateManagement() {
  const [testEmail, setTestEmail] = useState('');
  const [sending, setSending] = useState(false);

  const handleDownload = () => {
    const blob = new Blob([EMAIL_TEMPLATE_HTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'toadtoe-introduction-email.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Email template downloaded successfully');
  };

  const handleSendTest = async () => {
    if (!testEmail) {
      toast.error('Please enter an email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(testEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setSending(true);
    try {
      const { error } = await supabase.functions.invoke('send-introduction-email', {
        body: { email: testEmail }
      });

      if (error) throw error;

      toast.success(`Test email sent to ${testEmail}`);
      setTestEmail('');
    } catch (error: any) {
      console.error('Send test email error:', error);
      toast.error(error.message || 'Failed to send test email');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Email Template Management</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Preview, download, and test the introduction email template sent to new users.
        </p>
      </div>

      {/* Preview Card */}
      <Card>
        <CardHeader>
          <CardTitle>Email Template Preview</CardTitle>
          <CardDescription>
            This is the introduction email template sent to new users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <iframe
              srcDoc={EMAIL_TEMPLATE_HTML}
              className="w-full h-[600px] border-0"
              title="Email Template Preview"
            />
          </div>
        </CardContent>
      </Card>

      {/* Download and Test Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Download */}
          <div>
            <h3 className="text-sm font-medium mb-2">Download Template</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Download the HTML file to view or edit the email template locally
            </p>
            <Button onClick={handleDownload} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download HTML
            </Button>
          </div>

          {/* Send Test */}
          <div>
            <h3 className="text-sm font-medium mb-2">Send Test Email</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Send a test email to verify the template appearance and delivery
            </p>
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="test-email" className="sr-only">
                  Test Email Address
                </Label>
                <Input
                  id="test-email"
                  type="email"
                  placeholder="Enter email address"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  disabled={sending}
                />
              </div>
              <Button onClick={handleSendTest} disabled={sending || !testEmail}>
                <Send className="h-4 w-4 mr-2" />
                {sending ? 'Sending...' : 'Send Test'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
