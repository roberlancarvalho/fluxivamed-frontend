import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginComponent {
  credentials = {
    email: '',
    password: '',
  };

  constructor(private authService: AuthService, private router: Router) {}

  currentYear: number = new Date().getFullYear();

  login() {
    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        console.log('Login bem-sucedido!', response);

        localStorage.setItem('accessToken', response.accessToken);

        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Erro no login!', err);
      },
    });
  }
}
