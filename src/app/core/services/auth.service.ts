import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  login(credentials: any): Observable<AuthResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    };

    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials, httpOptions);
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    console.log('Logout efetuado. Token removido.');
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }
}
