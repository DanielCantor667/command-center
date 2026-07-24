import { supabaseAdmin } from './supabase-admin';

export class AuthenticationError extends Error {}

export async function requireUser(request: Request) {
  const authorization = request.headers.get('authorization');
  const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : null;
  if (!token) throw new AuthenticationError('Authentication required');

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) throw new AuthenticationError('Invalid session');
  return data.user;
}
