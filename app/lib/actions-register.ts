'use server'

import { z } from 'zod';
import bcrypt from 'bcryptjs';
import User from '@/app/lib/models/User';
import connectDB from '@/app/lib/db';
import { redirect } from 'next/navigation';

const RegisterSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function register(prevState: string | undefined, formData: FormData) {
  const validatedFields = RegisterSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return 'Invalid fields. Please check your input.';
  }

  const { name, email, password } = validatedFields.data;

  try {
    await connectDB();
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return 'Email already in use.';
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ 
      name, 
      email, 
      password: hashedPassword,
      role: 'student', // Default role
      languageLearning: 'Spanish', // Default for MVP
      level: 'Beginner', // Default level
      streak: 0,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return 'Failed to create user.';
  }

  redirect('/login');
}
