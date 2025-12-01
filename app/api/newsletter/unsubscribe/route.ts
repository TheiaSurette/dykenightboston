import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if contact exists
    const contact = await resend.contacts.get({
      email: normalizedEmail,
    });

    if (!contact.data) {
      return NextResponse.json(
        { error: 'Email not found in our subscriber list' },
        { status: 404 }
      );
    }

    // Unsubscribe using Resend API
    const { error } = await resend.contacts.update({
      email: normalizedEmail,
      unsubscribed: true,
    });

    if (error) {
      console.error('Resend unsubscribe error:', error);
      return NextResponse.json(
        { error: 'Failed to unsubscribe. Please try again later.' },
        { status: 500 }
      );
    }

    // Return HTML page for better UX
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Unsubscribed</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 50px auto;
              padding: 20px;
              text-align: center;
            }
            h1 {
              color: #000;
            }
            p {
              color: #666;
            }
          </style>
        </head>
        <body>
          <h1>Successfully Unsubscribed</h1>
          <p>You have been unsubscribed from the Dyke Night Boston newsletter.</p>
          <p>We're sorry to see you go! You can resubscribe anytime from our homepage.</p>
        </body>
      </html>
    `;

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    return NextResponse.json(
      { error: 'Failed to unsubscribe. Please try again later.' },
      { status: 500 }
    );
  }
}

