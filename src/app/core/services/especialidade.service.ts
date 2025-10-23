import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class EspecialidadeService {
  private apiUrl = `${environment.apiUrl}/api/v1/especialidades`;

  constructor(private http: HttpClient) {}

  getEspecialidades(): Observable<string[]> {
    return this.http.get<string[]>(this.apiUrl);
  }
}
