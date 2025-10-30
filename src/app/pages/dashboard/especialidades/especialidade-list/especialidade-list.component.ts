import { CommonModule } from '@angular/common';
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
import {
  Especialidade,
  EspecialidadeService,
} from '../../../../core/services/especialidade.service';

@Component({
  selector: 'app-especialidade-list',
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
  templateUrl: './especialidade-list.component.html',
  styleUrl: './especialidade-list.component.scss',
})
export class EspecialidadeListComponent implements OnInit, OnDestroy {
  especialidades: Especialidade[] = [];
  isLoading: boolean = true;
  errorMessage: string | null = null;

  displayedColumns: string[] = ['id', 'nome', 'acoes'];

  private especialidadesSubscription: Subscription | null = null;

  constructor(
    private especialidadeService: EspecialidadeService,
    private router: Router,
    private _snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.carregarEspecialidades();
  }

  ngOnDestroy(): void {
    this.especialidadesSubscription?.unsubscribe();
  }

  carregarEspecialidades(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.especialidadesSubscription = this.especialidadeService
      .getEspecialidades()
      .pipe(
        finalize(() => (this.isLoading = false)),
        catchError((err: HttpErrorResponse) => {
          console.error('Erro ao carregar especialidades:', err);
          this.errorMessage = `Erro ${err.status}: Não foi possível carregar as especialidades.`;
          this._snackBar.open(this.errorMessage, 'Fechar', {
            duration: 5000,
            panelClass: ['snackbar-error'],
          });
          return of([]);
        })
      )
      .subscribe((dados) => {
        this.especialidades = dados;
      });
  }

  editarEspecialidade(id: number | null): void {
    if (id) {
      this.router.navigate(['/dashboard/especialidades/editar', id]);
    }
  }

  excluirEspecialidade(id: number | null): void {
    if (!id) {
      console.error('ID da especialidade inválido para exclusão');
      return;
    }

    if (
      confirm(
        `Tem certeza que deseja excluir a especialidade ID ${id}? Esta ação não pode ser desfeita.`
      )
    ) {
      this.isLoading = true;
      this.especialidadeService
        .excluirEspecialidade(id)
        .pipe(finalize(() => (this.isLoading = false)))
        .subscribe({
          next: () => {
            this._snackBar.open('Especialidade excluída com sucesso!', 'Fechar', {
              duration: 3000,
              panelClass: ['snackbar-success'],
            });
            this.carregarEspecialidades();
          },
          error: (err: HttpErrorResponse) => {
            console.error('Erro ao excluir especialidade:', err);

            const message =
              err.error?.error || err.error?.message || 'Erro ao excluir especialidade.';

            this._snackBar.open(message, 'Fechar', {
              duration: 5000,
              panelClass: ['snackbar-error'],
            });
          },
        });
    }
  }
}
