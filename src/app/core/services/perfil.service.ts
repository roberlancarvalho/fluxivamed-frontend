import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Especialidade } from './especialidade.service';

export interface ProfileResponse {
  id: number;
  email: string;
  fullName: string;
  telefone: string | null;
  crm: string | null;
  especialidadeId: number | null;
  especialidadeNome: string | null;
  fotoUrl: string | null;
}

export interface ProfileUpdateRequest {
  fullName: string;
  telefone: string | null;
  password?: string | null;
  crm?: string | null;
  especialidade?: Especialidade | null;
}

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private apiUrl = `${environment.apiUrl}/api/v1/profile`;

  constructor(private http: HttpClient) {}

  getMyProfile(): Observable<ProfileResponse> {
    return this.http.get<ProfileResponse>(`${this.apiUrl}/me`);
  }

  updateMyProfile(payload: ProfileUpdateRequest): Observable<ProfileResponse> {
    return this.http.put<ProfileResponse>(`${this.apiUrl}/me`, payload);
  }

  uploadAvatar(file: File): Observable<{ fotoUrl: string }> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    // Não precisa de Headers 'Content-Type', o navegador define
    // 'multipart/form-data' automaticamente com o FormData
    return this.http.put<{ fotoUrl: string }>(`${this.apiUrl}/me/avatar`, formData);
  }
}
