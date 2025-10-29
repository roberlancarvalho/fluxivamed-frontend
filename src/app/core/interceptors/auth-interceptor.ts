import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const accessToken = authService.getAccessToken();

  if (req.url.includes('/auth/login') || req.url.includes('/auth/register')) {
    return next(req);
  }

  if (accessToken) {
    const cloned = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${accessToken}`),
    });
    return next(cloned);
  }

  return next(req);
};
