import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
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

export interface Page<T> {
  content: T[];
  pageable: any;
  last: boolean;
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  sort: any;
  first: boolean;
  numberOfElements: number;
  empty: boolean;
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

  buscarDisponiveis(filtros: any, page: number, size: number): Observable<Page<Plantao>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (filtros.hospitalId) {
      params = params.append('hospitalId', filtros.hospitalId);
    }
    if (filtros.data) {
      params = params.append('data', filtros.data); // Assumindo formato YYYY-MM-DD
    }

    return this.http.get<Page<Plantao>>(`${this.apiUrl}/disponiveis`, { params });
  }
}
