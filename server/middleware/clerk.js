import { clerkMiddleware, getAuth } from '@clerk/express';

export const clerk = clerkMiddleware();

export function requireUser(req, res, next) {
  const auth = getAuth(req);

  console.log('auth', auth);
  

  if (!auth.isAuthenticated) return res.status(401).json({
    message: 'Authentication required'
  });
  
  req.userId = auth.userId;
  next();
}
