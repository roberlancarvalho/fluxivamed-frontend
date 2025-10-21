import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Hospital {
  id: number;
  nome: string;
  cnpj?: string;
  endereco?: string;
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
}
