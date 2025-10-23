import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { catchError, finalize, of } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { PlantaoResponse, PlantaoService } from '../../../../core/services/plantao.service';

@Component({
  selector: 'app-plantao-detalhes',
  standalone: true,
  imports: [CommonModule, ToastModule, ButtonModule, TagModule, TableModule],
  templateUrl: './plantao-detalhes.component.html',
  styleUrl: './plantao-detalhes.component.scss',
  providers: [MessageService],
})
export class PlantaoDetalhesComponent implements OnInit {
  plantao: PlantaoResponse | undefined;
  isLoading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private plantaoService: PlantaoService,
    private messageService: MessageService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const plantaoId = params.get('id');
      if (plantaoId) {
        this.loadPlantaoDetalhes(Number(plantaoId));
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'ID do plantão não fornecido.',
        });
        this.router.navigate(['/dashboard/plantoes']);
      }
    });
  }

  loadPlantaoDetalhes(id: number): void {
    this.isLoading = true;
    this.plantaoService
      .getPlantaoById(id)
      .pipe(
        finalize(() => (this.isLoading = false)),
        catchError((error: HttpErrorResponse) => {
          console.error('Erro ao carregar detalhes do plantão', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: error.error?.message || 'Não foi possível carregar os detalhes do plantão.',
          });
          this.router.navigate(['/dashboard/plantoes']);
          return of(undefined);
        })
      )
      .subscribe((data) => {
        this.plantao = data;
        if (this.plantao?.candidatos) {
          this.plantao.candidatos.sort((a, b) =>
            (a.user.fullName || '').localeCompare(b.user.fullName || '')
          );
        }
      });
  }

  getSeverity(status: string): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' {
    switch (status) {
      case 'DISPONIVEL':
        return 'success';
      case 'AGUARDANDO_APROVACAO':
        return 'warn';
      case 'PREENCHIDO':
        return 'info';
      case 'REALIZADO':
        return 'secondary';
      case 'CANCELADO':
        return 'danger';
      default:
        return 'info';
    }
  }

  aprovarCandidatura(medicoId: number): void {
    if (!this.plantao?.id) return;
    this.isLoading = true;
    this.plantaoService
      .aprovarCandidatura(this.plantao.id, medicoId)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (data) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Candidatura aprovada com sucesso!',
          });
          this.plantao = data;
        },
        error: (error: HttpErrorResponse) => {
          console.error('Erro ao aprovar candidatura', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: error.error?.message || 'Não foi possível aprovar a candidatura.',
          });
        },
      });
  }

  candidatar(plantaoId: number): void {
    this.isLoading = true;
    this.plantaoService
      .candidatarPlantao(plantaoId)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (data) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Candidatura realizada com sucesso!',
          });
          this.plantao = data;
        },
        error: (error: HttpErrorResponse) => {
          console.error('Erro ao candidatar-se', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: error.error?.message || 'Não foi possível candidatar-se ao plantão.',
          });
        },
      });
  }

  voltar(): void {
    this.router.navigate(['/dashboard/plantoes']);
  }

  editarPlantao(plantaoId: number): void {
    this.router.navigate(['/dashboard/plantoes/editar', plantaoId]);
  }
}
