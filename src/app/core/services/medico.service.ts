import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Especialidade } from './especialidade.service';

export interface User {
  id: number;
  email: string;
  fullName: string;
}

export interface MedicoRequest {
  email: string;
  password?: string;
  nomeCompleto: string;
  crm: string;
  especialidade: Especialidade;
}

export interface MedicoResponseDTO {
  id: number;
  nomeCompleto: string;
  crm: string;
  especialidade: Especialidade;
  email: string;
}

export interface MedicoDisponivelDTO {
  id: number;
  nomeCompleto: string;
  crm: string;
  especialidade: Especialidade;
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

  criarMedico(medico: MedicoRequest): Observable<MedicoResponseDTO> {
    return this.http.post<MedicoResponseDTO>(`${this.apiUrl}/register`, medico);
  }

  getMedicoById(id: number): Observable<MedicoResponseDTO> {
    return this.http.get<MedicoResponseDTO>(`${this.apiUrl}/${id}`);
  }

  atualizarMedico(id: number, medico: MedicoRequest): Observable<MedicoResponseDTO> {
    const { password, ...updateData } = medico;
    return this.http.put<MedicoResponseDTO>(`${this.apiUrl}/${id}`, updateData);
  }

  getTodosMedicos(): Observable<MedicoResponseDTO[]> {
    return this.http.get<MedicoResponseDTO[]>(this.apiUrl);
  }

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

  getMinhaDisponibilidade(): Observable<PeriodoDisponibilidadeMedico[]> {
    return this.http.get<PeriodoDisponibilidadeMedico[]>(`${this.apiUrl}/minha-disponibilidade`);
  }

  salvarMinhaDisponibilidade(periodos: PeriodoDisponibilidadeMedico[]): Observable<void> {
    const periodosParaEnviar = periodos.map((p) => ({ inicio: p.inicio, fim: p.fim }));
    const request: DefinirDisponibilidadeRequest = { periodos: periodosParaEnviar };
    const urlCompleta = `${this.apiUrl}/minha-disponibilidade`;
    console.log('Enviando POST para:', urlCompleta, 'com payload:', request);
    return this.http.post<void>(urlCompleta, request);
  }

  deleteDisponibilidade(periodoId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/minha-disponibilidade/${periodoId}`);
  }
}
