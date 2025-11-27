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
        line-height: 1.6;
        color: #333;
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        background-color: #f5f5f5;
      }
      .container {
        background: white;
        border-radius: 12px;
        padding: 40px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      }
      .header {
        text-align: center;
        margin-bottom: 32px;
        padding-bottom: 24px;
        border-bottom: 2px solid #f0f0f0;
      }
      .logo {
        font-size: 32px;
        font-weight: bold;
        color: #2563eb;
        margin-bottom: 8px;
      }
      .tagline {
        font-size: 14px;
        color: #666;
        font-style: italic;
      }
      h1 {
        color: #1a1a1a;
        font-size: 24px;
        margin-bottom: 16px;
      }
      p {
        margin-bottom: 16px;
        color: #444;
      }
      .features {
        background: #f8fafc;
        border-radius: 8px;
        padding: 24px;
        margin: 24px 0;
      }
      .feature-item {
        margin-bottom: 16px;
        padding-left: 24px;
        position: relative;
      }
      .feature-item:before {
        content: "✓";
        position: absolute;
        left: 0;
        color: #2563eb;
        font-weight: bold;
      }
      .cta-button {
        display: inline-block;
        background: #2563eb;
        color: white;
        padding: 14px 32px;
        text-decoration: none;
        border-radius: 8px;
        font-weight: 600;
        margin: 24px 0;
        transition: background 0.3s;
      }
      .cta-button:hover {
        background: #1d4ed8;
      }
      .footer {
        margin-top: 32px;
        padding-top: 24px;
        border-top: 1px solid #e5e5e5;
        text-align: center;
        font-size: 12px;
        color: #666;
      }
      .categories {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin: 16px 0;
      }
      .category-tag {
        background: #dbeafe;
        color: #1e40af;
        padding: 6px 12px;
        border-radius: 16px;
        font-size: 12px;
        font-weight: 500;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="logo">ToadToe</div>
        <div class="tagline">Your Gateway to Financial Market Intelligence</div>
      </div>

      <h1>Hello! 👋</h1>
      
      <p>Welcome to <strong>ToadToe</strong> – your premier destination for comprehensive financial market analysis and expert insights.</p>

      <p>We're thrilled to have you join our community of informed traders, investors, and financial enthusiasts who rely on ToadToe for cutting-edge market intelligence.</p>

      <div class="features">
        <h3 style="margin-top: 0; color: #1a1a1a;">What Makes ToadToe Special?</h3>
        <div class="feature-item">
          <strong>Real-Time Market Analysis</strong> – Stay ahead with up-to-the-minute insights on commodities, equities, indices, and cryptocurrencies
        </div>
        <div class="feature-item">
          <strong>Expert Commentary</strong> – Learn from seasoned analysts and industry experts
        </div>
        <div class="feature-item">
          <strong>Comprehensive Coverage</strong> – From traditional markets to emerging digital assets
        </div>
        <div class="feature-item">
          <strong>Free & Premium Content</strong> – Access quality analysis with flexible reading options
        </div>
      </div>

      <h3 style="color: #1a1a1a;">Explore Our Coverage:</h3>
      <div class="categories">
        <span class="category-tag">📊 Commodities</span>
        <span class="category-tag">💹 Equities</span>
        <span class="category-tag">📈 Indices</span>
        <span class="category-tag">₿ Cryptocurrencies</span>
        <span class="category-tag">📰 Market News</span>
      </div>

      <center>
        <a href="https://yoursite.com" class="cta-button">Start Exploring ToadToe</a>
      </center>

      <p style="margin-top: 32px;">Whether you're a seasoned trader or just starting your investment journey, ToadToe provides the insights you need to make informed decisions in today's dynamic markets.</p>

      <p><strong>Have questions or feedback?</strong><br>
      We'd love to hear from you at <a href="mailto:contact@toadtoe.online" style="color: #2563eb;">contact@toadtoe.online</a></p>

      <div class="footer">
        <p>© ${new Date().getFullYear()} ToadToe. All rights reserved.</p>
        <p>Stay informed. Trade smarter. Invest confidently.</p>
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
