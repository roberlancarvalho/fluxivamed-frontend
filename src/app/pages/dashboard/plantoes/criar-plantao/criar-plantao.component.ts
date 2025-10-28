import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { catchError, finalize, of, tap } from 'rxjs';
import {
  Especialidade,
  EspecialidadeService,
} from '../../../../core/services/especialidade.service';
import { Hospital, HospitalService } from '../../../../core/services/hospital.service';
import {
  PlantaoRequest,
  PlantaoResponse,
  PlantaoService,
} from '../../../../core/services/plantao.service';

const OUTRA_ESPECIALIDADE_PLACEHOLDER: Especialidade = { id: -1, nome: 'Outra' };

@Component({
  selector: 'app-criar-plantao',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ToastModule, ButtonModule, ProgressSpinnerModule],
  templateUrl: './criar-plantao.component.html',
  styleUrl: './criar-plantao.component.scss',
  providers: [MessageService, DatePipe],
})
export class CriarPlantaoComponent implements OnInit {
  plantaoForm!: FormGroup;
  hospitais: Hospital[] = [];
  isLoading: boolean = false;
  especialidadesDisponiveis: Especialidade[] = [];
  showOtherEspecialidadeInput: boolean = false;
  plantaoId: number | null = null;
  isEditMode: boolean = false;

  constructor(
    private fb: FormBuilder,
    private hospitalService: HospitalService,
    private plantaoService: PlantaoService,
    private especialidadeService: EspecialidadeService,
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.plantaoId = this.route.snapshot.params['id']
      ? parseInt(this.route.snapshot.params['id'], 10)
      : null;
    this.isEditMode = !!this.plantaoId;

    this.initForm();
    this.loadHospitais();
    this.loadEspecialidades();

    this.plantaoForm.get('especialidade')?.valueChanges.subscribe((value: Especialidade | null) => {
      this.showOtherEspecialidadeInput = this.isOutraEspecialidade(value);
      if (!this.showOtherEspecialidadeInput) {
        this.plantaoForm.get('outraEspecialidade')?.setValue('');
        this.plantaoForm.get('outraEspecialidade')?.clearValidators();
      } else {
        this.plantaoForm
          .get('outraEspecialidade')
          ?.setValidators([Validators.required, Validators.pattern(/^[a-zA-Z\s\-]+$/)]);
      }
      this.plantaoForm.get('outraEspecialidade')?.updateValueAndValidity();
    });
  }

  initForm(): void {
    this.plantaoForm = this.fb.group(
      {
        hospitalId: [null, Validators.required],
        especialidade: [null as Especialidade | null, Validators.required],
        outraEspecialidade: [''],
        inicio: ['', Validators.required],
        fim: ['', Validators.required],
        valor: ['', [Validators.required, Validators.min(0.01)]],
      },
      { validators: this.dateRangeValidator }
    );
  }

  dateRangeValidator(form: FormGroup): { [key: string]: boolean } | null {
    const inicio = form.get('inicio')?.value;
    const fim = form.get('fim')?.value;
    if (inicio && fim && new Date(inicio) >= new Date(fim)) {
      return { dateRangeInvalid: true };
    }
    return null;
  }

  loadHospitais(): void {
    this.hospitalService.getHospitais().subscribe({
      next: (data) => {
        this.hospitais = data;
      },
      error: (error) => {
        console.error('Erro ao carregar hospitais:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível carregar os hospitais.',
        });
      },
    });
  }

  loadEspecialidades(): void {
    this.isLoading = true;
    this.especialidadeService
      .getEspecialidades()
      .pipe(
        catchError((err) => {
          console.error('Erro ao carregar especialidades:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Não foi possível carregar as especialidades.',
          });
          return of([]);
        }),
        tap((data: Especialidade[]) => {
          console.log('Especialidades carregadas (Plantao):', data);
          this.especialidadesDisponiveis = [...data, OUTRA_ESPECIALIDADE_PLACEHOLDER];
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe(() => {
        if (this.isEditMode && this.plantaoId) {
          this.loadPlantaoParaEdicao(this.plantaoId);
        }
      });
  }

  loadPlantaoParaEdicao(id: number): void {
    this.isLoading = true;
    this.plantaoService
      .getPlantaoById(id) // Recebe PlantaoResponse com Id e Nome
      .pipe(
        catchError((error) => {
          console.error('Erro ao carregar plantão para edição:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: error.error?.message || 'Não foi possível carregar o plantão para edição.',
          });
          this.router.navigate(['/dashboard/plantoes/listar-plantoes']);
          return of(null);
        }),
        finalize(() => (this.isLoading = false))
      )
      .subscribe((plantao) => {
        // plantao é do tipo PlantaoResponse
        if (plantao) {
          const inicioFormatted = this.datePipe.transform(
            new Date(plantao.inicio),
            'yyyy-MM-ddTHH:mm'
          );
          const fimFormatted = this.datePipe.transform(new Date(plantao.fim), 'yyyy-MM-ddTHH:mm');

          let especialidadeObj = this.especialidadesDisponiveis.find(
            (esp) => esp.id === plantao.especialidadeId // <<< USA especialidadeId
          );
          let outraEspecialidadeValor = '';

          if (!especialidadeObj && plantao.especialidadeNome) {
            const nomeExisteNaLista = this.especialidadesDisponiveis
              .filter((e) => e.id !== OUTRA_ESPECIALIDADE_PLACEHOLDER.id)
              .some((e) => e.nome === plantao.especialidadeNome);

            if (!nomeExisteNaLista) {
              especialidadeObj = OUTRA_ESPECIALIDADE_PLACEHOLDER;
              outraEspecialidadeValor = plantao.especialidadeNome;
            } else if (!especialidadeObj) {
              especialidadeObj = this.especialidadesDisponiveis.find(
                (e) => e.nome === plantao.especialidadeNome
              );
            }
          }

          this.plantaoForm.patchValue({
            hospitalId: plantao.hospitalId,
            especialidade: especialidadeObj,
            outraEspecialidade: outraEspecialidadeValor,
            inicio: inicioFormatted,
            fim: fimFormatted,
            valor: plantao.valor,
          });
        }
      });
  }

  compareEspecialidade(o1: Especialidade | null, o2: Especialidade | null): boolean {
    return o1?.id === o2?.id;
  }

  isOutraEspecialidade(especialidade: Especialidade | null): boolean {
    return !!especialidade && especialidade.id === OUTRA_ESPECIALIDADE_PLACEHOLDER.id;
  }

  onSubmit(): void {
    if (this.plantaoForm.invalid) {
      this.plantaoForm.markAllAsTouched();
      this.messageService.add({
        severity: 'error',
        summary: 'Erro de Validação',
        detail: 'Por favor, preencha todos os campos corretamente.',
      });
      return;
    }

    this.isLoading = true;
    const formValue = this.plantaoForm.value;

    let especialidadeParaEnviar: Especialidade;
    const especialidadeSelecionada: Especialidade = formValue.especialidade;

    if (this.isOutraEspecialidade(especialidadeSelecionada)) {
      especialidadeParaEnviar = { id: null as any, nome: formValue.outraEspecialidade };
    } else if (especialidadeSelecionada && especialidadeSelecionada.id !== null) {
      especialidadeParaEnviar = especialidadeSelecionada;
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Especialidade inválida.',
      });
      this.isLoading = false;
      return;
    }

    const plantao: PlantaoRequest = {
      hospitalId: parseInt(formValue.hospitalId, 10),
      especialidade: especialidadeParaEnviar,
      inicio: new Date(formValue.inicio).toISOString(),
      fim: new Date(formValue.fim).toISOString(),
      valor: parseFloat(formValue.valor),
    };

    const operationObservable =
      this.isEditMode && this.plantaoId
        ? this.plantaoService.atualizarPlantao(this.plantaoId, plantao)
        : this.plantaoService.criarPlantao(plantao);

    operationObservable.subscribe({
      next: (response: PlantaoResponse) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: `Plantão ${this.isEditMode ? 'atualizado' : 'criado'} com sucesso!`,
        });
        this.plantaoForm.reset();
        this.router.navigate(['/dashboard/plantoes/listar-plantoes']);
      },
      error: (error) => {
        console.error(`Erro ao ${this.isEditMode ? 'atualizar' : 'criar'} plantão:`, error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail:
            error.error?.message ||
            `Não foi possível ${this.isEditMode ? 'atualizar' : 'criar'} o plantão.`,
        });
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  cancelar(): void {
    this.router.navigate(['/dashboard/plantoes/listar-plantoes']);
  }
}
