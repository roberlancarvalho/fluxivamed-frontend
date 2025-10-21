import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { Page, Plantao, PlantaoService } from '../../../../core/services/plantao.service';

@Component({
  selector: 'app-buscar-plantoes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './buscar-plantoes.component.html',
  styleUrl: './buscar-plantoes.component.scss',
})
export class BuscarPlantoesComponent implements OnInit {
  filtroForm: FormGroup;
  plantoesPaginados$!: Observable<Page<Plantao>>;

  hospitais = [
    { id: 1, nome: 'Hospital Central de Niterói' },
    { id: 2, nome: 'Hospital Santa Marta' },
  ];

  constructor(private fb: FormBuilder, private plantaoService: PlantaoService) {
    this.filtroForm = this.fb.group({
      hospitalId: [''],
      data: [''],
    });
  }

  ngOnInit(): void {
    this.buscar();
  }

  buscar(page: number = 0, size: number = 10): void {
    const filtros = this.filtroForm.value;
    this.plantoesPaginados$ = this.plantaoService.buscarDisponiveis(filtros, page, size);
  }

  onFiltroSubmit(): void {
    this.buscar();
  }

  /**
   * MÉTODO: Chamado quando o botão 'Candidatar-se' é clicado.
   * @param plantaoId O ID do plantão.
   */
  onCandidatarSe(plantaoId: string): void {
    if (!plantaoId) {
      console.error('ID do plantão não fornecido.');
      return;
    }

    this.plantaoService.candidatarSe(plantaoId).subscribe({
      next: (plantaoAtualizado) => {
        alert(
          `Candidatura para o plantão de ${plantaoAtualizado.especialidade} enviada com sucesso!`
        );
        this.buscar();
      },
      error: (err) => {
        console.error('Erro ao se candidatar ao plantão:', err);
        const errorMessage =
          err.error?.message ||
          'Não foi possível enviar a candidatura. Tente novamente mais tarde.';
        alert(`Erro: ${errorMessage}`);
      },
    });
  }
}
