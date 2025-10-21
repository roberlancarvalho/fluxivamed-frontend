import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PlantaoRequest, PlantaoResponse } from './hospital.service';

export interface Plantao {
  id: number;
  hospitalId: number;
  nomeHospital: string;
  medicoId: number | null;
  nomeMedico: string | null;
  especialidade: string;
  inicio: string;
  fim: string;
  valor: number;
  status: string;
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
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString());

    if (filtros.hospitalId) {
      params = params.append('hospitalId', filtros.hospitalId);
    }
    if (filtros.data) {
      params = params.append('data', filtros.data);
    }

    return this.http.get<Page<Plantao>>(`${this.apiUrl}/disponiveis`, { params });
  }

  /**
   * NOVO MÉTODO: Envia a candidatura de um médico para um plantão específico.
   * @param plantaoId O ID do plantão ao qual o médico está se candidatando.
   * @returns Um Observable com o plantão atualizado.
   */
  candidatarSe(plantaoId: string): Observable<Plantao> {
    // O AuthInterceptor adicionará o token JWT automaticamente.
    // O corpo da requisição é vazio, conforme o endpoint do backend.
    return this.http.post<Plantao>(`${this.apiUrl}/${plantaoId}/candidatar-se`, {});
  }

  criarPlantao(plantao: PlantaoRequest): Observable<PlantaoResponse> {
    return this.http.post<PlantaoResponse>(this.apiUrl, plantao);
  }
}
