import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Especialidade {
  id: number | null;
  nome: string;
}

export interface EspecialidadeRequest {
  nome: string;
}

@Injectable({
  providedIn: 'root',
})
export class EspecialidadeService {
  private apiUrl = `${environment.apiUrl}/api/v1/especialidades`;

  constructor(private http: HttpClient) {}

  getEspecialidades(): Observable<Especialidade[]> {
    return this.http.get<Especialidade[]>(this.apiUrl);
  }

  getEspecialidadeById(id: number): Observable<Especialidade> {
    return this.http.get<Especialidade>(`${this.apiUrl}/${id}`);
  }

  criarEspecialidade(especialidade: EspecialidadeRequest): Observable<Especialidade> {
    return this.http.post<Especialidade>(this.apiUrl, especialidade);
  }

  atualizarEspecialidade(
    id: number,
    especialidade: EspecialidadeRequest
  ): Observable<Especialidade> {
    return this.http.put<Especialidade>(`${this.apiUrl}/${id}`, especialidade);
  }

  excluirEspecialidade(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
