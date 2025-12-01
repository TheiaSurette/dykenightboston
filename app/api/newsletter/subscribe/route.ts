import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email address is required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Create or update contact in Resend (single API call)
    // This will create if doesn't exist, or update if exists
    const contactResult = await resend.contacts.create({
      email: normalizedEmail,
      unsubscribed: false,
    });

    // Handle rate limiting
    if (contactResult.error) {
      if (contactResult.error.statusCode === 429) {
        return NextResponse.json(
          { error: 'Too many requests. Please try again in a moment.' },
          { status: 429 }
        );
      }
      
      // If contact already exists, try to update instead
      if (contactResult.error.message?.includes('already exists') || contactResult.error.message?.includes('duplicate')) {
        try {
          const updateResult = await resend.contacts.update({
            email: normalizedEmail,
            unsubscribed: false,
          });

          if (updateResult.error) {
            console.error('Resend contact update error:', updateResult.error);
            return NextResponse.json(
              { error: 'Failed to subscribe. Please try again later.' },
              { status: 500 }
            );
          }


          return NextResponse.json(
            { message: 'Successfully subscribed to our newsletter!' },
            { status: 200 }
          );
        } catch (error) {
          console.error('Resend contact update error:', error);
          return NextResponse.json(
            { error: 'Failed to subscribe. Please try again later.' },
            { status: 500 }
          );
        }
      }

      console.error('Resend contact creation error:', contactResult.error);
      return NextResponse.json(
        { error: 'Failed to subscribe. Please try again later.' },
        { status: 500 }
      );
    }

    // Successfully created contact
    // Contact is automatically added to Resend's default audience/segment
    // Admins can manage segments and send broadcasts through Resend dashboard

    return NextResponse.json(
      { message: 'Successfully subscribed to our newsletter!' },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Newsletter subscription error:', error);
    
    if (error.statusCode === 429) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again in a moment.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to subscribe. Please try again later.' },
      { status: 500 }
    );
  }
}

