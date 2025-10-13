import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Plantao {
  id: string;
  especialidade: string;
  data: string;
  inicio: string;
  fim: string;
  nomeHospital: string;
  valor: number;
  status: string;
  medicoResponsavel?: string;
}

@Injectable({
  providedIn: 'root',
})
export class PlantaoService {
  private apiUrl = `${environment.apiUrl}/api/v1/plantoes`;

  constructor(private http: HttpClient) {}

  /**
   * Obtém a lista de todos os plantões ou plantões do médico logado.
   */
  getPlantoes(): Observable<Plantao[]> {
    return this.http.get<Plantao[]>(`${this.apiUrl}/meus-plantoes`);
  }
  /**
   * Obtém um plantão específico pelo ID.
   */
  getPlantaoById(id: string): Observable<Plantao> {
    return this.http.get<Plantao>(`${this.apiUrl}/${id}`);
  }
}
