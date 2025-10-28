import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Especialidade {
  id: number;
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
}
