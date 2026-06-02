
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { createSession } from '@/lib/session';

export async function POST(req: NextRequest) {
  await dbConnect();
  const { email, password } = await req.json();

  try {
    const user = await User.findOne({ email });

    if (!user || !user.password) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    await createSession({ id: user._id, email: user.email });

    return NextResponse.json({ message: 'Logged in successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error logging in', error }, { status: 500 });
  }
}
