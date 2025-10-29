import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Hospital {
  id: number | null;
  nome: string;
  cnpj: string;
  endereco?: string;
  telefone1: string;
  telefone2?: string;
}

export interface HospitalRequest {
  nome: string;
  cnpj: string;
  endereco?: string;
  telefone1: string;
  telefone2?: string;
}

@Injectable({
  providedIn: 'root',
})
export class HospitalService {
  private apiUrl = `${environment.apiUrl}/api/v1/hospitais`;

  constructor(private http: HttpClient) {}

  getHospitais(): Observable<Hospital[]> {
    return this.http.get<Hospital[]>(this.apiUrl);
  }

  getHospitalById(id: number): Observable<Hospital> {
    return this.http.get<Hospital>(`${this.apiUrl}/${id}`);
  }

  criarHospital(hospital: HospitalRequest): Observable<Hospital> {
    return this.http.post<Hospital>(this.apiUrl, hospital);
  }

  atualizarHospital(id: number, hospital: HospitalRequest): Observable<Hospital> {
    return this.http.put<Hospital>(`${this.apiUrl}/${id}`, hospital);
  }

  excluirHospital(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
