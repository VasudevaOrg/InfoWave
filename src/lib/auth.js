import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'infowave_super_secret_session_token_key_2026';

export async function verifyAuth(requiredRole) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (requiredRole && decoded.role !== requiredRole) {
      return null;
    }
    return decoded;
  } catch (error) {
    return null;
  }
}
