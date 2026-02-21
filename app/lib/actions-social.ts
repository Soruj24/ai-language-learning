'use server';

import { signIn } from '@/app/lib/auth';

export async function googleSignIn() {
  await signIn('google');
}
