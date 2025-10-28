import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { Especialidade } from './especialidade.service';

export enum StatusPlantao {
  DISPONIVEL = 'DISPONIVEL',
  AGUARDANDO_APROVACAO = 'AGUARDANDO_APROVACAO',
  PREENCHIDO = 'PREENCHIDO',
  REALIZADO = 'REALIZADO',
  CANCELADO = 'CANCELADO',
}

export interface User {
  id: number;
  email: string;
  fullName: string;
}

export interface Medico {
  id: number;
  crm: string;
  user: User;
  especialidade?: Especialidade;
}

export interface PlantaoRequest {
  hospitalId: number;
  especialidade: Especialidade;
  inicio: string;
  fim: string;
  valor: number;
}

export interface MedicoResponseDTO {
  id: number | null;
  crm: string | null;
  nomeCompleto: string | null;
  email: string | null;
  telefone: string | null;
  especialidadeNome: string | null;
}

export interface PlantaoResponse {
  id: number;
  hospitalId: number;
  nomeHospital: string;
  medicoId: number | null;
  nomeMedico: string | null;
  especialidadeId: number | null;
  especialidadeNome: string | null;
  inicio: string;
  fim: string;
  valor: number;
  status: StatusPlantao;
  candidatos?: MedicoResponseDTO[];
}

export interface PageResponse<T> {
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

export interface FiltrosBuscaPlantoes {
  hospitalId?: number;
  data?: string;
  status?: StatusPlantao[];
}

@Injectable({
  providedIn: 'root',
})
export class PlantaoService {
  private apiUrl = `${environment.apiUrl}/api/v1/plantoes`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  criarPlantao(plantao: PlantaoRequest): Observable<PlantaoResponse> {
    return this.http.post<PlantaoResponse>(this.apiUrl, plantao);
  }

  getPlantaoById(id: number): Observable<PlantaoResponse> {
    return this.http.get<PlantaoResponse>(`${this.apiUrl}/${id}`);
  }

  atualizarPlantao(id: number, plantao: PlantaoRequest): Observable<PlantaoResponse> {
    return this.http.put<PlantaoResponse>(`${this.apiUrl}/${id}`, plantao);
  }

  getMeusPlantoes(): Observable<PlantaoResponse[]> {
    return this.http.get<PlantaoResponse[]>(`${this.apiUrl}/meus`);
  }

  buscarPlantoesDisponiveis(
    filtros: FiltrosBuscaPlantoes,
    page: number,
    size: number
  ): Observable<PageResponse<PlantaoResponse>> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString());

    if (filtros.hospitalId != null) {
      params = params.append('hospitalId', filtros.hospitalId.toString());
    }
    if (filtros.data) {
      params = params.append('data', filtros.data);
    }
    if (filtros.status && filtros.status.length > 0) {
      filtros.status.forEach((s) => {
        params = params.append('status', s);
      });
    }

    return this.http.get<PageResponse<PlantaoResponse>>(`${this.apiUrl}/disponiveis`, { params });
  }

  candidatarPlantao(plantaoId: number): Observable<PlantaoResponse> {
    return this.http.post<PlantaoResponse>(`${this.apiUrl}/${plantaoId}/candidatar`, {});
  }

  aprovarCandidatura(plantaoId: number, medicoId: number): Observable<PlantaoResponse> {
    return this.http.put<PlantaoResponse>(`${this.apiUrl}/${plantaoId}/aprovar/${medicoId}`, {});
  }

  excluirPlantao(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
