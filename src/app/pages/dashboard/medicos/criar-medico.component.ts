import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { catchError, finalize, of, tap } from 'rxjs';
import { Especialidade, EspecialidadeService } from '../../../core/services/especialidade.service'; // <<< Importar objeto
import {
  MedicoRequest,
  MedicoResponseDTO,
  MedicoService,
} from '../../../core/services/medico.service';
// import { AuthService, User } from '../../../core/services/auth.service'; // Ajuste se necessário

@Component({
  selector: 'app-criar-medico',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ToastModule, ButtonModule, ProgressSpinnerModule],
  templateUrl: './criar-medico.component.html',
  styleUrl: './criar-medico.component.scss',
  providers: [MessageService], // Removido DatePipe se não usado
})
export class CriarMedicoComponent implements OnInit {
  medicoForm!: FormGroup;
  isLoading: boolean = false;
  especialidadesDisponiveis: Especialidade[] = []; // <<< ALTERADO para Especialidade[]
  // showOtherEspecialidadeInput: boolean = false; // Removido
  medicoId: number | null = null;
  isEditMode: boolean = false;
  // currentUser: User | null = null; // Removido

  constructor(
    private fb: FormBuilder,
    private medicoService: MedicoService,
    private especialidadeService: EspecialidadeService,
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute
  ) // private authService: AuthService // Removido
  {}

  ngOnInit(): void {
    this.medicoId = this.route.snapshot.params['id']
      ? parseInt(this.route.snapshot.params['id'], 10)
      : null;
    this.isEditMode = !!this.medicoId;

    this.initForm();
    this.loadEspecialidades();

    // Remover lógica de 'Outra'
    // this.medicoForm.get('especialidade')?.valueChanges.subscribe((value) => { ... });
  }

  initForm(): void {
    this.medicoForm = this.fb.group({
      nomeCompleto: ['', Validators.required],
      crm: ['', Validators.required],
      especialidade: [null as Especialidade | null, Validators.required], // <<< ALTERADO para objeto ou null
      // outraEspecialidade: [''], // Removido
      email: ['', [Validators.required, Validators.email]],
      password: ['', this.isEditMode ? [] : [Validators.required, Validators.minLength(6)]],
    });
  }

  loadEspecialidades(): void {
    this.isLoading = true;
    this.especialidadeService
      .getEspecialidades() // <<< CORRETO: Chama o método que retorna Observable<Especialidade[]>
      .pipe(
        catchError((err) => {
          console.error('Erro ao carregar especialidades:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Não foi possível carregar as especialidades.',
          });
          return of([]); // <<< CORRETO: Retorna array vazio de Especialidade
        }),
        tap((data: Especialidade[]) => {
          // <<< CORRETO: data é Especialidade[]
          console.log('Especialidades carregadas (Medico):', data); // Log para depurar
          this.especialidadesDisponiveis = data; // <<< CORRETO: Atribui Especialidade[]
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
      .getMedicoById(id) // Retorna MedicoResponseDTO com objeto Especialidade
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
          // Encontra o objeto Especialidade pelo ID retornado pela API de Medico
          const especialidadeObj = this.especialidadesDisponiveis.find(
            (esp) => esp.id === medico.especialidade.id // <<< CORRETO: Compara por ID
          );

          this.medicoForm.patchValue({
            nomeCompleto: medico.nomeCompleto,
            crm: medico.crm,
            especialidade: especialidadeObj, // <<< CORRETO: Seta o objeto
            email: medico.email,
          });
        }
      });
  }

  onSubmit(): void {
    // Remover lógica de 'Outra'
    // if (this.showOtherEspecialidadeInput) { ... }

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

    const especialidadeSelecionada: Especialidade = formValue.especialidade; // <<< CORRETO: Objeto

    if (!especialidadeSelecionada || !especialidadeSelecionada.id) {
      // <<< Verifica ID
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
      especialidade: especialidadeSelecionada, // <<< CORRETO: Envia o objeto
      email: formValue.email,
      password: formValue.password, // Incluir senha se presente
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
        this.router.navigate(['/dashboard/medicos']);
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
    this.router.navigate(['/dashboard/medicos']);
  }
}
