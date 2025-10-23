import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { catchError, finalize, of, tap } from 'rxjs';
import { EspecialidadeService } from '../../../../core/services/especialidade.service';
import { Hospital, HospitalService } from '../../../../core/services/hospital.service';
import {
  PlantaoRequest,
  PlantaoResponse,
  PlantaoService,
} from '../../../../core/services/plantao.service';

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
  especialidadesDisponiveis: string[] = [];
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

    this.plantaoForm.get('especialidade')?.valueChanges.subscribe((value) => {
      this.showOtherEspecialidadeInput = value === 'Outra';
      if (!this.showOtherEspecialidadeInput) {
        this.plantaoForm.get('outraEspecialidade')?.setValue('');
      }
    });
  }

  initForm(): void {
    this.plantaoForm = this.fb.group(
      {
        hospitalId: ['', Validators.required],
        especialidade: ['', Validators.required],
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
            detail: 'Não foi possível carregar as especialidades. Usando lista fallback.',
          });
          return of(['Clínico Geral', 'Pediatra', 'Cardiologista']);
        }),
        tap((data) => {
          this.especialidadesDisponiveis = [...data, 'Outra'];
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
      .getPlantaoById(id)
      .pipe(
        catchError((error) => {
          console.error('Erro ao carregar plantão para edição:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: error.error?.message || 'Não foi possível carregar o plantão para edição.',
          });
          this.router.navigate(['/dashboard/plantoes']);
          return of(null);
        }),
        finalize(() => (this.isLoading = false))
      )
      .subscribe((plantao) => {
        if (plantao) {
          const inicioFormatted = this.datePipe.transform(
            new Date(plantao.inicio),
            'yyyy-MM-ddTHH:mm'
          );
          const fimFormatted = this.datePipe.transform(new Date(plantao.fim), 'yyyy-MM-ddTHH:mm');

          let especialidadeSelecionada = plantao.especialidade;
          let outraEspecialidadeValor = '';

          if (!this.especialidadesDisponiveis.includes(plantao.especialidade)) {
            especialidadeSelecionada = 'Outra';
            outraEspecialidadeValor = plantao.especialidade;
          }

          this.plantaoForm.patchValue({
            hospitalId: plantao.hospitalId,
            especialidade: especialidadeSelecionada,
            outraEspecialidade: outraEspecialidadeValor,
            inicio: inicioFormatted,
            fim: fimFormatted,
            valor: plantao.valor,
          });
        }
      });
  }

  onSubmit(): void {
    if (this.showOtherEspecialidadeInput) {
      this.plantaoForm
        .get('outraEspecialidade')
        ?.setValidators([Validators.required, Validators.pattern(/^[a-zA-Z\s\-]+$/)]);
    } else {
      this.plantaoForm.get('outraEspecialidade')?.clearValidators();
    }
    this.plantaoForm.get('outraEspecialidade')?.updateValueAndValidity();

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

    let finalEspecialidade = formValue.especialidade;
    if (finalEspecialidade === 'Outra') {
      finalEspecialidade = formValue.outraEspecialidade;
    }

    const plantao: PlantaoRequest = {
      hospitalId: parseInt(formValue.hospitalId, 10),
      especialidade: finalEspecialidade,
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
        this.router.navigate(['/dashboard/plantoes']);
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
    this.router.navigate(['/dashboard/plantoes']);
  }
}
