import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface IntroductionEmailRequest {
  email: string;
  name?: string;
}

function createIntroductionEmailHTML(name?: string): string {
  const greeting = name ? `Hello ${name}` : 'Hello';
  
  return `
<!DOCTYPE html>
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
        <h1>${greeting}!</h1>
        <p>Welcome to ToadToe</p>
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
</html>
  `.trim();
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name }: IntroductionEmailRequest = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Sending introduction email to:", email);

    const emailResponse = await resend.emails.send({
      from: "ToadToe <contact@toadtoe.online>",
      to: [email],
      subject: "Welcome to ToadToe - Your Financial Market Intelligence Hub",
      html: createIntroductionEmailHTML(name),
    });

    console.log("Introduction email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-introduction-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
