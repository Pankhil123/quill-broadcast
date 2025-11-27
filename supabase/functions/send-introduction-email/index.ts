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
  const greeting = name ? `Hi ${name}` : "Hello";
  
  return `
    <!DOCTYPE html>
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

          <h1>${greeting}! 👋</h1>
          
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
    </html>
  `;
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
