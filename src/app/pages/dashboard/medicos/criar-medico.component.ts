import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { catchError, finalize, of, tap } from 'rxjs';
import { Especialidade, EspecialidadeService } from '../../../core/services/especialidade.service';
import {
  MedicoRequest,
  MedicoService
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
  especialidadesDisponiveis: Especialidade[] = [];
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
    this.loadEspecialidades();
  }

  initForm(): void {
    this.medicoForm = this.fb.group({
      nomeCompleto: ['', Validators.required],
      crm: ['', Validators.required],
      especialidade: [null as Especialidade | null, Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', this.isEditMode ? [] : [Validators.required, Validators.minLength(6)]],
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
          console.log('Especialidades carregadas (Medico):', data);
          this.especialidadesDisponiveis = data;
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
          this.router.navigate(['/dashboard/medicos']);
          return of(null);
        }),
        finalize(() => (this.isLoading = false))
      )
      .subscribe((medico) => {
        if (medico) {
          const especialidadeObj = this.especialidadesDisponiveis.find(
            (esp) => esp.id === medico.especialidadeId
          );

          this.medicoForm.patchValue({
            nomeCompleto: medico.nomeCompleto,
            crm: medico.crm,
            especialidade: especialidadeObj,
            email: medico.email,
          });
        }
      });
  }

  compareEspecialidade(o1: Especialidade | null, o2: Especialidade | null): boolean {
    return o1?.id === o2?.id;
  }

  onSubmit(): void {
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

    const especialidadeSelecionada: Especialidade = formValue.especialidade;

    if (!especialidadeSelecionada || !especialidadeSelecionada.id) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Especialidade inválida selecionada.',
      });
      this.isLoading = false;
      return;
    }

    const medicoRequest: MedicoRequest = {
      nomeCompleto: formValue.nomeCompleto,
      crm: formValue.crm,
      especialidade: especialidadeSelecionada,
      email: formValue.email,
      password: formValue.password,
    };

    const operationObservable =
      this.isEditMode && this.medicoId
        ? this.medicoService.atualizarMedico(this.medicoId, medicoRequest)
        : this.medicoService.criarMedico(medicoRequest);

    operationObservable.subscribe({
      next: (response: any) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: `Médico ${this.isEditMode ? 'atualizado' : 'cadastrado'} com sucesso!`,
        });
        this.medicoForm.reset();
        this.router.navigate(['/dashboard/medicos/medicos']);
      },
      error: (error) => {
        console.error(`Erro ao ${this.isEditMode ? 'atualizar' : 'cadastrar'} médico:`, error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail:
            error.error?.error?.message ||
            `Não foi possível ${this.isEditMode ? 'atualizar' : 'cadastrar'} o médico.`,
        });
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  cancelar(): void {
    this.router.navigate(['/dashboard/medicos/medicos']);
  }
}
