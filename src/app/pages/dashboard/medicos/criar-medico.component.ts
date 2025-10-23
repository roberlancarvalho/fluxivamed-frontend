import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { catchError, finalize, of, tap } from 'rxjs';
import { EspecialidadeService } from '../../../core/services/especialidade.service';
import {
  MedicoRequest,
  MedicoResponseDTO,
  MedicoService,
} from '../../../core/services/medico.service';

@Component({
  selector: 'app-criar-medico',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ToastModule, ButtonModule, ProgressSpinnerModule],
  templateUrl: './criar-medico.component.html',
  styleUrl: './criar-medico.component.scss',
  providers: [MessageService],
})
export class CriarMedicoComponent implements OnInit {
  medicoForm!: FormGroup;
  isLoading: boolean = false;
  especialidadesDisponiveis: string[] = [];
  showOtherEspecialidadeInput: boolean = false;
  medicoId: number | null = null;
  isEditMode: boolean = false;

  constructor(
    private fb: FormBuilder,
    private medicoService: MedicoService,
    private especialidadeService: EspecialidadeService,
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.medicoId = this.route.snapshot.params['id']
      ? parseInt(this.route.snapshot.params['id'], 10)
      : null;
    this.isEditMode = !!this.medicoId;

    this.initForm();
    this.loadEspecialidades(); // Carrega especialidades antes de popular o formulário, se em edição

    this.medicoForm.get('especialidade')?.valueChanges.subscribe((value) => {
      this.showOtherEspecialidadeInput = value === 'Outra';
      if (!this.showOtherEspecialidadeInput) {
        this.medicoForm.get('outraEspecialidade')?.setValue('');
      }
    });
  }

  initForm(): void {
    this.medicoForm = this.fb.group({
      nomeCompleto: ['', Validators.required],
      crm: ['', Validators.required],
      especialidade: ['', Validators.required],
      outraEspecialidade: [''],
      email: ['', [Validators.required, Validators.email]],
      password: ['', this.isEditMode ? [] : [Validators.required, Validators.minLength(6)]], // Senha só é obrigatória na criação
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
        if (this.isEditMode && this.medicoId) {
          this.loadMedicoParaEdicao(this.medicoId);
        }
      });
  }

  loadMedicoParaEdicao(id: number): void {
    this.isLoading = true;
    this.medicoService
      .getMedicoById(id)
      .pipe(
        catchError((error) => {
          console.error('Erro ao carregar médico para edição:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: error.error?.message || 'Não foi possível carregar o médico para edição.',
          });
          this.router.navigate(['/dashboard/medicos']); // Redireciona para a lista de médicos
          return of(null);
        }),
        finalize(() => (this.isLoading = false))
      )
      .subscribe((medico) => {
        if (medico) {
          let especialidadeSelecionada = medico.especialidade;
          let outraEspecialidadeValor = '';

          if (!this.especialidadesDisponiveis.includes(medico.especialidade)) {
            especialidadeSelecionada = 'Outra';
            outraEspecialidadeValor = medico.especialidade;
          }

          this.medicoForm.patchValue({
            nomeCompleto: medico.nomeCompleto,
            crm: medico.crm,
            especialidade: especialidadeSelecionada,
            outraEspecialidade: outraEspecialidadeValor,
            email: medico.email,
            // Senha não é populada na edição por segurança
          });
        }
      });
  }

  onSubmit(): void {
    if (this.showOtherEspecialidadeInput) {
      this.medicoForm
        .get('outraEspecialidade')
        ?.setValidators([Validators.required, Validators.pattern(/^[a-zA-Z\s\-]+$/)]);
    } else {
      this.medicoForm.get('outraEspecialidade')?.clearValidators();
    }
    this.medicoForm.get('outraEspecialidade')?.updateValueAndValidity();

    if (this.medicoForm.invalid) {
      this.medicoForm.markAllAsTouched();
      this.messageService.add({
        severity: 'error',
        summary: 'Erro de Validação',
        detail: 'Por favor, preencha todos os campos corretamente.',
      });
      return;
    }

    this.isLoading = true;
    const formValue = this.medicoForm.value;

    let finalEspecialidade = formValue.especialidade;
    if (finalEspecialidade === 'Outra') {
      finalEspecialidade = formValue.outraEspecialidade;
    }

    const medicoRequest: MedicoRequest = {
      nomeCompleto: formValue.nomeCompleto,
      crm: formValue.crm,
      especialidade: finalEspecialidade,
      email: formValue.email,
      password: formValue.password, // Só será enviado na criação
    };

    const operationObservable =
      this.isEditMode && this.medicoId
        ? this.medicoService.atualizarMedico(this.medicoId, medicoRequest)
        : this.medicoService.criarMedico(medicoRequest);

    operationObservable.subscribe({
      next: (response: MedicoResponseDTO) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: `Médico ${this.isEditMode ? 'atualizado' : 'cadastrado'} com sucesso!`,
        });
        this.medicoForm.reset();
        this.router.navigate(['/dashboard/medicos']); // Redireciona para a lista de médicos
      },
      error: (error) => {
        console.error(`Erro ao ${this.isEditMode ? 'atualizar' : 'cadastrar'} médico:`, error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail:
            error.error?.message ||
            `Não foi possível ${this.isEditMode ? 'atualizar' : 'cadastrar'} o médico.`,
        });
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  cancelar(): void {
    this.router.navigate(['/dashboard/medicos']); // Redireciona para a lista de médicos
  }
}
