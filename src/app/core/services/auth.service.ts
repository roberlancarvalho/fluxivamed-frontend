import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, tap } from 'rxjs';
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
  private apiUrl = `${environment.apiUrl}/auth`;
  private userRoles: string[] = [];
  private loggedIn = new BehaviorSubject<boolean>(this.hasToken());

  constructor(private http: HttpClient) {
    this.loadUserRoles();
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  private decodeTokenAndSetRoles(token: string): void {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      this.userRoles = payload.scope || [];
      console.log('Roles do usuário carregadas:', this.userRoles);
    } catch (e) {
      console.error('Erro ao decodificar o token JWT:', e);
      this.userRoles = [];
    }
  }

  private loadUserRoles(): void {
    const token = this.getAccessToken();
    if (token) {
      this.decodeTokenAndSetRoles(token);
    } else {
      this.userRoles = [];
    }
    this.loggedIn.next(this.hasToken());
  }

  public hasRole(role: string): boolean {
    const formattedRole = role.startsWith('ROLE_')
      ? role.toUpperCase()
      : `ROLE_${role.toUpperCase()}`;
    return this.userRoles.map((r) => r.toUpperCase()).includes(formattedRole);
  }

  isLoggedIn$(): Observable<boolean> {
    return this.loggedIn.asObservable();
  }

  login(credentials: any): Observable<AuthResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    };
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials, httpOptions).pipe(
      tap((response) => {
        if (response && response.accessToken) {
          localStorage.setItem('accessToken', response.accessToken);
          this.decodeTokenAndSetRoles(response.accessToken);
          this.loggedIn.next(true);
        } else {
          this.logout();
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    this.userRoles = [];
    this.loggedIn.next(false);
    console.log('Logout efetuado. Token e roles removidos.');
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }
}
