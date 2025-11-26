import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from 'https://esm.sh/resend@2.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string);

function createWelcomeEmailHTML(email: string, firstName: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <tr>
            <td>
              <h1 style="color: #1e293b; font-size: 28px; font-weight: bold; margin: 40px 0; padding: 0;">
                Welcome to ToadToe, ${firstName}!
              </h1>
              <p style="color: #333; font-size: 14px; line-height: 1.6; margin: 24px 0;">
                Thank you for joining ToadToe - your source for financial market insights.
              </p>
              <p style="color: #333; font-size: 14px; line-height: 1.6; margin: 24px 0;">
                Your account has been successfully created and you can now access all our content.
              </p>
              <div style="margin: 32px 0;">
                <a href="https://toadtoe.online" 
                   target="_blank" 
                   style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
                   Start Reading
                </a>
              </div>
              <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
                <p style="color: #898989; font-size: 12px; line-height: 1.6; margin: 12px 0;">
                  <a href="https://toadtoe.online" target="_blank" style="color: #898989; text-decoration: underline;">ToadToe</a><br>
                  Your source for financial market insights<br>
                  Email: contact@toadtoe.online
                </p>
              </div>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, password, firstName, lastName, mobileNumber } = await req.json();

    // Input validation
    if (!email || !password || !firstName) {
      return new Response(
        JSON.stringify({ error: 'Email, password, and first name are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email address' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Password strength check
    if (password.length < 6) {
      return new Response(
        JSON.stringify({ error: 'Password must be at least 6 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase Admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    console.log('Creating user:', email);

    // Create user with Supabase Admin API
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        first_name: firstName,
        last_name: lastName || '',
        mobile_number: mobileNumber || ''
      }
    });

    if (userError) {
      console.error('Error creating user:', userError);
      
      // Handle duplicate email
      if (userError.message.includes('already registered')) {
        return new Response(
          JSON.stringify({ error: 'An account with this email already exists' }),
          { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: userError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('User created successfully:', userData.user.id);

    // Send welcome email via Resend
    try {
      const { error: emailError } = await resend.emails.send({
        from: 'ToadToe <contact@toadtoe.online>',
        to: [email],
        subject: 'Welcome to ToadToe!',
        html: createWelcomeEmailHTML(email, firstName),
      });

      if (emailError) {
        console.error('Error sending welcome email:', emailError);
        // Don't fail the signup if email fails
      } else {
        console.log('Welcome email sent to:', email);
      }
    } catch (emailErr) {
      console.error('Email sending failed:', emailErr);
      // Don't fail the signup if email fails
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Account created successfully! You can now sign in.',
        user: {
          id: userData.user.id,
          email: userData.user.email
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Custom signup error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
