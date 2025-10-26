import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AdminStats {
  plantoesDisponiveis: number;
  plantoesPendentes: number;
  totalMedicos: number;
  faturamentoPrevisto: number;
}

export interface MedicoStats {
  proximosPlantoes: number;
  candidaturasPendentes: number;
  pagamentosPendentes: number;
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/api/v1/dashboard/stats`;

  constructor(private http: HttpClient) {}

  getAdminStats(): Observable<AdminStats> {
    return this.http.get<AdminStats>(`${this.apiUrl}/admin`);
  }

  getMedicoStats(): Observable<MedicoStats> {
    return this.http.get<MedicoStats>(`${this.apiUrl}/medico`);
  }
}
