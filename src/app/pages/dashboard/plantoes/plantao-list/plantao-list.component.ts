import { CommonModule, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterLink } from '@angular/router';
import { TagModule } from 'primeng/tag';
import { Observable, Subscription, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { AuthService } from '../../../../core/services/auth.service';
import {
  FiltrosBuscaPlantoes,
  PageResponse,
  PlantaoResponse,
  PlantaoService,
  StatusPlantao,
} from '../../../../core/services/plantao.service';

@Component({
  selector: 'app-plantao-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    TagModule,
    MatTooltipModule,
    MatCardModule,
  ],
  templateUrl: './plantao-list.component.html',
  styleUrl: './plantao-list.component.scss',
  providers: [DatePipe],
})
export class PlantaoListComponent implements OnInit, OnDestroy {
  meusPlantoes: PlantaoResponse[] = [];
  plantoesPaginados: PageResponse<PlantaoResponse> | null = null;
  isLoading: boolean = true;
  errorMessage: string | null = null;
  isMedico: boolean = false;
  isAdminOrEscalista: boolean = false;

  displayedColumnsMedico: string[] = [
    'hospitalNome',
    'especialidade',
    'inicio',
    'fim',
    'valor',
    'status',
    'acoes',
  ];

  displayedColumnsAdmin: string[] = [
    'id',
    'hospitalNome',
    'especialidade',
    'inicio',
    'fim',
    'valor',
    'status',
    'medicoNome',
    'acoes',
  ];

  private plantoesSubscription: Subscription | null = null;

  constructor(
    private plantaoService: PlantaoService,
    private authService: AuthService,
    private router: Router,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.isMedico = this.authService.hasRole('MEDICO');
    this.isAdminOrEscalista =
      this.authService.hasRole('ADMIN') ||
      this.authService.hasRole('HOSPITAL_ADMIN') ||
      this.authService.hasRole('ESCALISTA');
    this.carregarPlantoes();
  }

  ngOnDestroy(): void {
    this.plantoesSubscription?.unsubscribe();
  }

  carregarPlantoes(page: number = 0, size: number = 10): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.meusPlantoes = [];
    this.plantoesPaginados = null;

    let observableSource: Observable<PlantaoResponse[] | PageResponse<PlantaoResponse>>;

    if (this.isMedico) {
      observableSource = this.plantaoService.getMeusPlantoes();
    } else if (this.isAdminOrEscalista) {
      const filtros: FiltrosBuscaPlantoes = {};
      observableSource = this.plantaoService.buscarPlantoesDisponiveis(filtros, page, size);
    } else {
      this.errorMessage = 'Usuário sem permissão para visualizar plantões.';
      this.isLoading = false;
      return;
    }

    this.plantoesSubscription = observableSource
      .pipe(
        finalize(() => (this.isLoading = false)),
        catchError((err: HttpErrorResponse) => {
          console.error('Erro ao carregar plantões:', err);
          this.errorMessage = `Erro ${err.status}: Não foi possível carregar os plantões.`;
          if (err.status === 403) {
            this.errorMessage += ' Acesso negado.';
          }
          this._snackBar.open(this.errorMessage, 'Fechar', {
            duration: 5000,
            panelClass: ['snackbar-error'],
          });
          return of(this.isMedico ? [] : this.createEmptyPageResponse());
        })
      )
      .subscribe((dados) => {
        console.log('DADOS DA API:', dados);
        if (dados) {
          if (this.isPage(dados)) {
            this.plantoesPaginados = dados;
          } else {
            this.meusPlantoes = dados as PlantaoResponse[];
          }
        } else {
          if (!this.isMedico) {
            this.plantoesPaginados = this.createEmptyPageResponse();
          }
        }
      });
  }

  private createEmptyPageResponse(): PageResponse<PlantaoResponse> {
    return {
      content: [],
      pageable: { pageNumber: 0, pageSize: 10 },
      last: true,
      totalElements: 0,
      totalPages: 0,
      size: 10,
      number: 0,
      sort: {},
      first: true,
      numberOfElements: 0,
      empty: true,
    };
  }

  editarPlantao(id: number | undefined): void {
    if (id) {
      this.router.navigate(['/dashboard/plantoes/editar', id]);
    } else {
      console.error('ID do plantão inválido para edição.');
      this._snackBar.open('ID do plantão inválido para edição.', 'Fechar', { duration: 3000 });
    }
  }

  verDetalhesPlantao(id: number | undefined): void {
    if (id) {
      this.router.navigate(['/dashboard/plantoes', id]);
    } else {
      console.error('ID do plantão inválido para ver detalhes.');
      this._snackBar.open('ID do plantão inválido para ver detalhes.', 'Fechar', {
        duration: 3000,
      });
    }
  }

  excluirPlantao(id: number | undefined): void {
    if (!id) {
      console.error('ID do plantão inválido para exclusão');
      this._snackBar.open('ID do plantão inválido para exclusão.', 'Fechar', { duration: 3000 });
      return;
    }

    if (confirm(`Tem certeza que deseja excluir o plantão ID ${id}?`)) {
      this.isLoading = true;
      this.plantaoService
        .excluirPlantao(id)
        .pipe(finalize(() => (this.isLoading = false)))
        .subscribe({
          next: () => {
            this._snackBar.open('Plantão excluído com sucesso!', 'Fechar', {
              duration: 3000,
              panelClass: ['snackbar-success'],
            });
            const currentPage = this.plantoesPaginados?.number ?? 0;
            const currentSize = this.plantoesPaginados?.size ?? 10;
            this.carregarPlantoes(currentPage, currentSize);
          },
          error: (err: HttpErrorResponse) => {
            console.error('Erro ao excluir plantão:', err);
            const message = err.error?.message || 'Erro ao excluir plantão.';
            this._snackBar.open(message, 'Fechar', {
              duration: 5000,
              panelClass: ['snackbar-error'],
            });
          },
        });
    }
  }

  isPage(
    data: PageResponse<PlantaoResponse> | PlantaoResponse[] | null
  ): data is PageResponse<PlantaoResponse> {
    return !!data && (data as PageResponse<PlantaoResponse>)?.content !== undefined;
  }

  onPageChange(event: PageEvent): void {
    if (this.isAdminOrEscalista) {
      this.carregarPlantoes(event.pageIndex, event.pageSize);
    }
  }

  getSeverity(
    status: string | StatusPlantao
  ): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
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
        return 'Para Aprovar';
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
}
