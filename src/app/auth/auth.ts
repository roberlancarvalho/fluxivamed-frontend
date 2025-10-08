import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/auth';

  constructor(private http: HttpClient) {}

  /**
   * Envia as credenciais para o endpoint de login da API.
   * @param credentials Objeto com email e password
   * @returns Um Observable com a resposta do backend (esperamos um token)
   */
  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }
}
