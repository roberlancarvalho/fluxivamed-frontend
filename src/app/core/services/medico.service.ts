import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface MedicoDisponivelDTO {
  id: number;
  nomeCompleto: string;
  crm: string;
  especialidade: string;
}

export interface MedicoBuscaDisponibilidadeParams {
  inicio: string;
  fim: string;
  especialidade?: string;
}

export interface PeriodoDisponibilidadeMedico {
  id?: number;
  inicio: string;
  fim: string;
  dataInicio?: Date;
  dataFim?: Date;
}

export interface DefinirDisponibilidadeRequest {
  periodos: PeriodoDisponibilidadeMedico[];
}

@Injectable({
  providedIn: 'root',
})
export class MedicoService {
  private apiUrl = `${environment.apiUrl}/api/v1/medicos`;

  constructor(private http: HttpClient) {}

  findMedicosDisponiveis(
    params: MedicoBuscaDisponibilidadeParams
  ): Observable<MedicoDisponivelDTO[]> {
    let httpParams = new HttpParams().set('inicio', params.inicio).set('fim', params.fim);

    if (params.especialidade) {
      httpParams = httpParams.set('especialidade', params.especialidade);
    }
    return this.http.get<MedicoDisponivelDTO[]>(`${this.apiUrl}/disponibilidade`, {
      params: httpParams,
    });
  }

  /**
   * Busca os períodos de disponibilidade salvos pelo próprio médico.
   * Consumirá o endpoint: GET /api/v1/medicos/minha-disponibilidade
   */
  getMinhaDisponibilidade(): Observable<PeriodoDisponibilidadeMedico[]> {
    return this.http.get<PeriodoDisponibilidadeMedico[]>(`${this.apiUrl}/minha-disponibilidade`);
  }

  /**
   * Salva os novos períodos de disponibilidade do médico.
   * Consumirá o endpoint: POST /api/v1/medicos/minha-disponibilidade
   */
  salvarMinhaDisponibilidade(periodos: PeriodoDisponibilidadeMedico[]): Observable<void> {
    const request: DefinirDisponibilidadeRequest = { periodos: periodos };

    const urlCompleta = `${this.apiUrl}/minha-disponibilidade`;

    console.log('Enviando POST para:', urlCompleta, 'com payload:', request);

    return this.http.post<void>(urlCompleta, request);
  }

  deleteDisponibilidade(periodoId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/minha-disponibilidade/${periodoId}`);
  }
}
