import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0'
import { Resend } from 'https://esm.sh/resend@2.0.0'

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string)
const hookSecret = Deno.env.get('SEND_EMAIL_HOOK_SECRET') as string

function createEmailHTML(confirmLink: string, token: string): string {
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
                Welcome to ToadToe
              </h1>
              <p style="color: #333; font-size: 14px; line-height: 1.6; margin: 24px 0;">
                Thank you for signing up! Please confirm your email address to get started with ToadToe.
              </p>
              <div style="margin: 32px 0;">
                <a href="${confirmLink}" 
                   target="_blank" 
                   style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
                  Confirm Email Address
                </a>
              </div>
              <p style="color: #333; font-size: 14px; line-height: 1.6; margin: 24px 0 14px 0;">
                Or, copy and paste this confirmation code:
              </p>
              <div style="display: block; padding: 16px; background-color: #f4f4f4; border-radius: 5px; border: 1px solid #eee; color: #333; font-family: monospace; font-size: 16px; word-break: break-all;">
                ${token}
              </div>
              <p style="color: #ababab; font-size: 14px; line-height: 1.6; margin: 24px 0;">
                If you didn't sign up for ToadToe, you can safely ignore this email.
              </p>
              <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
                <p style="color: #898989; font-size: 12px; line-height: 1.6; margin: 12px 0;">
                  <a href="https://toadtoe.online" target="_blank" style="color: #898989; text-decoration: underline;">ToadToe</a><br>
                  Your source for financial market insights
                </p>
              </div>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('not allowed', { status: 400 })
  }

  const payload = await req.text()
  const headers = Object.fromEntries(req.headers)
  const wh = new Webhook(hookSecret)
  
  try {
    const {
      user,
      email_data: { token, token_hash, redirect_to, email_action_type },
    } = wh.verify(payload, headers) as {
      user: {
        email: string
      }
      email_data: {
        token: string
        token_hash: string
        redirect_to: string
        email_action_type: string
        site_url: string
        token_new: string
        token_hash_new: string
      }
    }

    console.log('Sending auth email to:', user.email)
    console.log('Email action type:', email_action_type)

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const confirmLink = `${supabaseUrl}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`
    
    const html = createEmailHTML(confirmLink, token)

    const { error } = await resend.emails.send({
      from: 'ToadToe <contact@toadtoe.online>',
      to: [user.email],
      subject: 'Welcome to ToadToe - Confirm your email',
      html,
    })
    
    if (error) {
      console.error('Resend error:', error)
      throw error
    }

    console.log('Auth email sent successfully to:', user.email)
  } catch (error) {
    console.error('Error in send-auth-email function:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorCode = (error as any)?.code
    return new Response(
      JSON.stringify({
        error: {
          http_code: errorCode,
          message: errorMessage,
        },
      }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }

  const responseHeaders = new Headers()
  responseHeaders.set('Content-Type', 'application/json')
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: responseHeaders,
  })
})
