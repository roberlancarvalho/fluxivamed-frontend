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
import { MedicoResponseDTO, MedicoService } from '../../../../core/services/medico.service';

@Component({
  selector: 'app-medico-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule
],
  templateUrl: './medico-list.component.html',
  styleUrl: './medico-list.component.scss',
  providers: [DatePipe],
})
export class MedicoListComponent implements OnInit, OnDestroy {
  medicos: MedicoResponseDTO[] = [];
  isLoading: boolean = true;
  errorMessage: string | null = null;

  displayedColumns: string[] = [
    'id',
    'nomeCompleto',
    'email',
    'crm',
    'especialidadeNome',
    'telefone',
    'acoes',
  ];

  private medicosSubscription: Subscription | null = null;

  constructor(
    private medicoService: MedicoService,
    private router: Router,
    private _snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.carregarMedicos();
  }

  ngOnDestroy(): void {
    this.medicosSubscription?.unsubscribe();
  }

  carregarMedicos(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.medicosSubscription = this.medicoService
      .getTodosMedicos()
      .pipe(
        finalize(() => (this.isLoading = false)),
        catchError((err: HttpErrorResponse) => {
          console.error('Erro ao carregar médicos:', err);
          this.errorMessage = `Erro ${err.status}: Não foi possível carregar os médicos.`;
          this._snackBar.open(this.errorMessage, 'Fechar', {
            duration: 5000,
            panelClass: ['snackbar-error'],
          });
          return of([]);
        })
      )
      .subscribe((dados) => {
        this.medicos = dados;
      });
  }

  editarMedico(id: number | null): void {
    if (id) {
      this.router.navigate(['/dashboard/medicos/editar', id]);
    }
  }

  excluirMedico(id: number | null): void {
    if (!id) {
      console.error('ID do médico inválido para exclusão');
      return;
    }

    if (confirm(`Tem certeza que deseja excluir o médico ID ${id}?`)) {
      console.log('Excluir médico ID:', id);
      // Implementar exclusão no service e chamar aqui
      // this.medicoService.excluirMedico(id).subscribe(() => ...);
    }
  }
}
