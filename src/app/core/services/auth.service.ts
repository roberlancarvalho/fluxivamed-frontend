import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
}

interface JwtPayload {
  sub: string;
  scope: string[];
  exp: number;
  iat: number;
  fullName: string;
  userId?: number;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private userRoles: string[] = [];
  private currentUserEmail: string | null = null;
  private currentUserName: string | null = null;
  private loggedIn = new BehaviorSubject<boolean>(this.hasToken());

  constructor(private http: HttpClient) {
    this.loadAuthDataFromToken();
  }

  public getCurrentUserEmail(): string | null {
    return this.currentUserEmail;
  }

  public getUserRoles(): string[] {
    return [...this.userRoles];
  }

  public getUserName(): string | null {
    return this.currentUserName;
  }

  public getUserFullName(): string | null {
    return this.currentUserName;
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  private decodeTokenAndSetData(token: string): void {
    try {
      const payload: JwtPayload = JSON.parse(atob(token.split('.')[1]));
      this.userRoles = payload.scope || [];
      this.currentUserEmail = payload.sub || null;
      this.currentUserName = payload.fullName || null;
      console.log('Roles do usuário carregadas:', this.userRoles);
      console.log('Email do usuário carregado:', this.currentUserEmail);
    } catch (e) {
      console.error('Erro ao decodificar o token JWT:', e);
      this.userRoles = [];
      this.currentUserEmail = null;
      this.currentUserName = null;
    }
  }

  private loadAuthDataFromToken(): void {
    const token = this.getAccessToken();
    if (token) {
      this.decodeTokenAndSetData(token);
    } else {
      this.userRoles = [];
      this.currentUserEmail = null;
      this.currentUserName = null;
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
          this.decodeTokenAndSetData(response.accessToken);
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
    this.currentUserEmail = null;
    this.currentUserName = null;
    this.loggedIn.next(false);
    console.log('Logout efetuado. Token, roles e email removidos.');
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }
}
