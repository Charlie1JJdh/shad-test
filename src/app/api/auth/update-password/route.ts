import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { token, password } = await request.json();

  if (!token || !password) {
    return NextResponse.json(
      { error: 'Token and password are required' },
      { status: 400 }
    );
  }

  const supabase = createRouteHandlerClient({ cookies });

  try {
    // First, exchange the token for a session
    const { data: sessionData, error: sessionError } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: 'recovery',
    });

    if (sessionError || !sessionData) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 400 }
      );
    }

    // Then update the password
    const { data: updateData, error: updateError } = await supabase.auth.updateUser({
      password: password,
    });

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      message: 'Password updated successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update password' },
      { status: 500 }
    );
  }
}
