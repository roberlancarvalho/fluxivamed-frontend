import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router); // 1. Injetamos o Router
  const accessToken = authService.getAccessToken();

  // Se for login ou registro, não anexe o token e não trate o erro 401
  if (req.url.includes('/auth/login') || req.url.includes('/auth/register')) {
    return next(req);
  }

  // Clone a requisição e adicione o token (se existir)
  let authReq = req;
  if (accessToken) {
    authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${accessToken}`),
    });
  }

  // --- ESTA É A PARTE NOVA ---
  // Envie a requisição e adicione o .pipe(catchError(...))
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      
      // Se a API retornar 401 (Token expirado/inválido)
      if (error.status === 401) {
        console.error('Interceptor: Erro 401. Token expirado ou inválido. Deslogando...');
        
        // 1. Desloga o usuário
        authService.logout();
        
        // 2. Redireciona para a tela de login
        // (Isso impede que o AuthGuard faça um redirecionamento "fantasma")
        router.navigate(['/auth/login'], { 
          queryParams: { sessionExpired: 'true' } // Opcional: para mostrar msg de erro
        });
      }

      // Repassa o erro para o service que fez a chamada
      return throwError(() => error);
    })
  );
  // --- FIM DA PARTE NOVA ---
};