// src/app/pages/dashboard/plantoes/plantao-list/plantao-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlantaoService, Plantao, Page } from '../../../../core/services/plantao.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Observable, Subscription } from 'rxjs'; // Importar Subscription
import { HttpErrorResponse } from '@angular/common/http'; // Para erro

@Component({
  selector: 'app-plantao-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './plantao-list.component.html',
  styleUrl: './plantao-list.component.scss',
})
export class PlantaoListComponent implements OnInit {
editarPlantao(arg0: number) {
throw new Error('Method not implemented.');
}
excluirPlantao(arg0: number) {
throw new Error('Method not implemented.');
}
  // Propriedades separadas para os dados
  meusPlantoes: Plantao[] = [];
  plantoesPaginados: Page<Plantao> | null = null;
  isLoading: boolean = true; // Flag para indicar carregamento
  errorMessage: string | null = null; // Para mensagens de erro

  // Flags de role
  isMedico: boolean = false;
  isAdminOrEscalista: boolean = false;

  private plantoesSubscription: Subscription | null = null; // Para gerenciar a inscrição

  constructor(
    private plantaoService: PlantaoService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isMedico = this.authService.hasRole('MEDICO');
    this.isAdminOrEscalista = this.authService.hasRole('ADMIN') || this.authService.hasRole('HOSPITAL_ADMIN') || this.authService.hasRole('ESCALISTA');
    this.carregarPlantoes();
  }

  ngOnDestroy(): void {
    // Cancela a inscrição ao destruir o componente para evitar memory leaks
    this.plantoesSubscription?.unsubscribe();
  }

  carregarPlantoes(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.meusPlantoes = []; // Limpa dados antigos
    this.plantoesPaginados = null; // Limpa dados antigos

    let observableSource: Observable<Plantao[] | Page<Plantao>>;

    if (this.isMedico) {
      observableSource = this.plantaoService.getMeusPlantoes();
    } else if (this.isAdminOrEscalista) {
      observableSource = this.plantaoService.buscarDisponiveis({}, 0, 10); // Busca inicial para admins
    } else {
      this.errorMessage = "Usuário sem permissão para visualizar plantões.";
      this.isLoading = false;
      return; // Sai se não tiver role
    }

    this.plantoesSubscription = observableSource.subscribe({
      next: (dados) => {
        if (this.isPage(dados)) {
          this.plantoesPaginados = dados;
          console.log('Plantoes Paginados Carregados:', this.plantoesPaginados);
        } else {
          this.meusPlantoes = dados;
          console.log('Meus Plantoes Carregados:', this.meusPlantoes);
        }
        this.isLoading = false;
      },
      error: (err: HttpErrorResponse) => {
        console.error("Erro ao carregar plantões:", err);
        this.errorMessage = `Erro ${err.status}: Não foi possível carregar os plantões.`;
        if (err.status === 403) {
            this.errorMessage += " Acesso negado.";
        }
        this.isLoading = false;
      }
    });
  }

  // Helper para verificar se o dado é do tipo Page (type guard)
  isPage(data: Page<Plantao> | Plantao[]): data is Page<Plantao> {
    return (data as Page<Plantao>)?.content !== undefined;
  }

  // Métodos para paginação (a serem implementados no futuro)
  proximaPagina(): void {
    if (this.plantoesPaginados && !this.plantoesPaginados.last) {
        // this.carregarPlantoes(this.plantoesPaginados.number + 1); // Exemplo
        console.log('Ir para próxima página');
    }
  }

  paginaAnterior(): void {
     if (this.plantoesPaginados && !this.plantoesPaginados.first) {
        // this.carregarPlantoes(this.plantoesPaginados.number - 1); // Exemplo
        console.log('Ir para página anterior');
    }
  }
}