import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  credentials = {
    email: '',
    password: '',
  };
  errorMessage: string | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  currentYear: number = new Date().getFullYear();

  login() {
    this.errorMessage = null;

    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        console.log('Login bem-sucedido!', response);
        localStorage.setItem('accessToken', response.accessToken);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Erro no login!', err);
        if (err.status === 401) {
          this.errorMessage = 'Credenciais inválidas. Verifique seu email e senha.';
        } else if (err.error && err.error.message) {
          this.errorMessage = err.error.message;
        } else {
          this.errorMessage = 'Ocorreu um erro ao tentar fazer login. Tente novamente mais tarde.';
        }
      },
    });
  }
}
