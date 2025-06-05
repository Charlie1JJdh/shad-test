import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// Handle CORS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// Helper function to add CORS headers to responses
const addCorsHeaders = (response: NextResponse) => {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
};

// This endpoint is used to request a password reset email
export async function POST(request: Request) {
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 204 });
  }
  const { email } = await request.json();

  if (!email) {
    return NextResponse.json(
      { error: 'Email is required' },
      { status: 400 }
    );
  }

  console.log('Attempting to send password reset email to:', email);
  
  const supabase = createRouteHandlerClient({ cookies });
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const redirectTo = `${siteUrl}/update-password`;

  console.log('Using redirect URL:', redirectTo);

  try {
    console.log('Calling supabase.auth.resetPasswordForEmail with:', { email, redirectTo });
    
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectTo,
    });

    if (error) {
      console.error('Supabase password reset error:', {
        message: error.message,
        name: error.name,
        status: error.status,
        originalError: error.cause
      });
      
      // Don't reveal if the email exists or not
      const response = NextResponse.json({
        message: 'If an account exists with this email, you will receive a password reset link.',
      }, { status: 200 });
      
      return addCorsHeaders(response);
    }

    console.log('Password reset email sent successfully to:', email);
    
    const response = NextResponse.json({
      message: 'If an account exists with this email, you will receive a password reset link.',
    }, { status: 200 });
    
    return addCorsHeaders(response);
  } catch (error) {
    console.error('Unexpected error in password reset:', error);
    return NextResponse.json(
      { error: 'Failed to process your request. Please try again later.' },
      { status: 500 }
    );
  }
}

// This endpoint is used to update the password after clicking the reset link
export async function PUT(request: Request) {
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 204 });
  }
  const { token, password } = await request.json();

  if (!token || !password) {
    return NextResponse.json(
      { error: 'Token and password are required' },
      { status: 400 }
    );
  }

  const supabase = createRouteHandlerClient({ cookies });

  try {
    // First verify the token
    const { data: { user }, error: tokenError } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: 'recovery',
    });

    if (tokenError || !user) {
      console.error('Invalid or expired token:', tokenError);
      return NextResponse.json(
        { error: 'Invalid or expired token. Please request a new password reset.' },
        { status: 400 }
      );
    }

    // Then update the password
    const { error: updateError } = await supabase.auth.updateUser({
      password: password,
    });

    if (updateError) {
      console.error('Error updating password:', updateError);
      throw updateError;
    }

    const response = NextResponse.json({
    message: 'Password updated successfully!',
  });
  return addCorsHeaders(response);
  } catch (error) {
    console.error('Error in password update:', error);
    return NextResponse.json(
      { error: 'Failed to update password. Please try again.' },
      { status: 500 }
    );
  }
}
