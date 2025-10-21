import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getAccessToken();

  if (!token) {
    console.log('AuthGuard: Bloqueado (não logado). Redirecionando para login.');
    router.navigate(['/auth/login']);
    return false;
  }

  const requiredRoles = route.data['roles'] as Array<string> | undefined;

  if (requiredRoles && requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some((role) => authService.hasRole(role));

    if (!hasRequiredRole) {
      console.log(
        `AuthGuard: Bloqueado (role necessária: ${requiredRoles.join(
          ', '
        )}). Redirecionando para dashboard.`
      );
      router.navigate(['/dashboard']);
      return false;
    }
  }

  console.log('AuthGuard: Acesso permitido.');
  return true;
};
