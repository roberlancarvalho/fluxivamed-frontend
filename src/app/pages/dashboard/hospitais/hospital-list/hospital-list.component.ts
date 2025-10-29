import { CommonModule, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterLink } from '@angular/router';
import { Subscription, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { Hospital, HospitalService } from '../../../../core/services/hospital.service';

@Component({
  selector: 'app-hospital-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
  ],
  templateUrl: './hospital-list.component.html',
  styleUrl: './hospital-list.component.scss',
  providers: [],
})
export class HospitalListComponent implements OnInit, OnDestroy {
  hospitais: Hospital[] = [];
  isLoading: boolean = true;
  errorMessage: string | null = null;

  displayedColumns: string[] = ['id', 'nome', 'cnpj', 'telefone1', 'endereco', 'acoes'];

  private hospitaisSubscription: Subscription | null = null;

  constructor(
    private hospitalService: HospitalService,
    private router: Router,
    private _snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.carregarHospitais();
  }

  ngOnDestroy(): void {
    this.hospitaisSubscription?.unsubscribe();
  }

  carregarHospitais(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.hospitaisSubscription = this.hospitalService
      .getHospitais()
      .pipe(
        finalize(() => (this.isLoading = false)),
        catchError((err: HttpErrorResponse) => {
          console.error('Erro ao carregar hospitais:', err);
          this.errorMessage = `Erro ${err.status}: Não foi possível carregar os hospitais.`;
          this._snackBar.open(this.errorMessage, 'Fechar', {
            duration: 5000,
            panelClass: ['snackbar-error'],
          });
          return of([]);
        })
      )
      .subscribe((dados) => {
        this.hospitais = dados;
      });
  }

  editarHospital(id: number | null): void {
    if (id) {
      this.router.navigate(['/dashboard/hospitais/editar', id]);
    }
  }

  excluirHospital(id: number | null): void {
    if (!id) {
      console.error('ID do hospital inválido para exclusão');
      return;
    }

    if (confirm(`Tem certeza que deseja excluir o hospital ID ${id}?`)) {
      this.isLoading = true;
      this.hospitalService
        .excluirHospital(id)
        .pipe(finalize(() => (this.isLoading = false)))
        .subscribe({
          next: () => {
            this._snackBar.open('Hospital excluído com sucesso!', 'Fechar', {
              duration: 3000,
              panelClass: ['snackbar-success'],
            });
            this.carregarHospitais();
          },
          error: (err: HttpErrorResponse) => {
            console.error('Erro ao excluir hospital:', err);
            this._snackBar.open(err.error?.message || 'Erro ao excluir hospital.', 'Fechar', {
              duration: 5000,
              panelClass: ['snackbar-error'],
            });
          },
        });
    }
  }
}
