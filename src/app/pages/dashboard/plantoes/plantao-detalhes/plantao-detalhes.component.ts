import { CommonModule, DatePipe } from '@angular/common';
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
import {
  PlantaoResponse,
  PlantaoService,
  StatusPlantao,
} from '../../../../core/services/plantao.service';

@Component({
  selector: 'app-plantao-detalhes',
  standalone: true,
  imports: [CommonModule, ToastModule, ButtonModule, TagModule, TableModule, DatePipe],
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
      const plantaoIdStr = params.get('id');
      if (plantaoIdStr) {
        const plantaoId = Number(plantaoIdStr);
        if (!isNaN(plantaoId)) {
          this.loadPlantaoDetalhes(plantaoId);
        } else {
          console.error('ID do plantão inválido (NaN):', plantaoIdStr);
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'ID do plantão inválido.',
          });
          this.router.navigate(['/dashboard/plantoes/listar-plantoes']);
        }
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'ID do plantão não fornecido.',
        });
        this.router.navigate(['/dashboard/plantoes/listar-plantoes']);
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
          this.router.navigate(['/dashboard/plantoes/listar-plantoes']);
          return of(undefined);
        })
      )
      .subscribe((data) => {
        this.plantao = data;
        if (this.plantao?.candidatos) {
          this.plantao.candidatos.sort((a, b) =>
            (a.nomeCompleto || '').localeCompare(b.nomeCompleto || '')
          );
        }
      });
  }

  getSeverity(
    status: string | StatusPlantao
  ): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' {
    switch (status) {
      case StatusPlantao.DISPONIVEL:
        return 'success';
      case StatusPlantao.AGUARDANDO_APROVACAO:
        return 'warn';
      case StatusPlantao.PREENCHIDO:
        return 'info';
      case StatusPlantao.REALIZADO:
        return 'secondary';
      case StatusPlantao.CANCELADO:
        return 'danger';
      default:
        return 'info';
    }
  }

  formatStatus(status: string | StatusPlantao): string {
    switch (status) {
      case StatusPlantao.DISPONIVEL:
        return 'Disponível';
      case StatusPlantao.AGUARDANDO_APROVACAO:
        return 'Aguardando Aprovação';
      case StatusPlantao.PREENCHIDO:
        return 'Preenchido';
      case StatusPlantao.REALIZADO:
        return 'Realizado';
      case StatusPlantao.CANCELADO:
        return 'Cancelado';
      default:
        return status ? status.toString() : 'Desconhecido';
    }
  }

  aprovarCandidatura(medicoId: number | null): void {
    if (!this.plantao?.id || medicoId === null) return;
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
    this.router.navigate(['/dashboard/plantoes/listar-plantoes']);
  }

  editarPlantao(plantaoId: number): void {
    this.router.navigate(['/dashboard/plantoes/editar', plantaoId]);
  }
}
