import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { Especialidade, EspecialidadeService } from '../../../core/services/especialidade.service';
import {
  ProfileResponse,
  ProfileService,
  ProfileUpdateRequest,
} from '../../../core/services/perfil.service';

const OUTRA_ESPECIALIDADE_PLACEHOLDER: Especialidade = { id: -1, nome: 'Outra' };

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSelectModule,
  ],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.scss',
})
export class PerfilComponent implements OnInit {
  profileForm!: FormGroup;
  isLoading: boolean = true;
  isEditing: boolean = false;
  isMedico: boolean = false;
  especialidadesDisponiveis: Especialidade[] = [];
  showOtherEspecialidadeInput: boolean = false;
  private originalProfileData: ProfileResponse | null = null;
  private avatarFileToUpload: File | null = null;

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private especialidadeService: EspecialidadeService,
    private authService: AuthService,
    private _snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.isMedico = this.authService.hasRole('MEDICO');
    this.initForm();

    if (this.isMedico) {
      this.loadEspecialidades();
    } else {
      this.loadProfile();
    }
  }

  initForm(): void {
    this.profileForm = this.fb.group({
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      fullName: [{ value: '', disabled: true }, Validators.required],
      telefone: [{ value: '', disabled: true }],
      crm: [{ value: '', disabled: true }],
      especialidade: [{ value: null as Especialidade | null, disabled: true }],
      outraEspecialidade: [{ value: '', disabled: true }],
      password: ['', [Validators.minLength(6)]],
      confirmPassword: ['', [this.confirmPasswordValidator()]],
    });

    this.profileForm.get('password')?.disable();
    this.profileForm.get('confirmPassword')?.disable();

    if (this.isMedico) {
      this.profileForm.get('crm')?.setValidators(Validators.required);
      this.profileForm.get('especialidade')?.setValidators(Validators.required);
    }

    this.profileForm.get('especialidade')?.valueChanges.subscribe((value: Especialidade | null) => {
      this.showOtherEspecialidadeInput = this.isOutraEspecialidade(value);
      const outraControl = this.profileForm.get('outraEspecialidade');
      if (!this.showOtherEspecialidadeInput) {
        outraControl?.setValue('');
        outraControl?.clearValidators();
      } else {
        outraControl?.setValidators([Validators.required, Validators.pattern(/^[a-zA-Z\s\-]+$/)]);
      }
      outraControl?.updateValueAndValidity();
    });
  }

  confirmPasswordValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (!this.profileForm) {
        return null;
      }
      const password = this.profileForm.get('password')?.value;
      const confirmPassword = control.value;
      return password && confirmPassword && password !== confirmPassword
        ? { passwordMismatch: true }
        : null;
    };
  }

  loadEspecialidades(): void {
    this.especialidadeService
      .getEspecialidades()
      .pipe(
        catchError(() => of([])),
        tap((data) => {
          this.especialidadesDisponiveis = [...data, OUTRA_ESPECIALIDADE_PLACEHOLDER];
        })
      )
      .subscribe(() => {
        this.loadProfile();
      });
  }

  loadProfile(): void {
    this.isLoading = true;
    this.profileService
      .getMyProfile()
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (profile) => {
          this.originalProfileData = profile;
          this.populateForm(profile);
        },
        error: (err: HttpErrorResponse) => {
          this._snackBar.open(err.error?.message || 'Erro ao carregar perfil.', 'Fechar', {
            duration: 3000,
          });
        },
      });
  }

  getFotoUrl(): string {
    if (this.avatarFileToUpload) {
      return URL.createObjectURL(this.avatarFileToUpload);
    }
    if (this.originalProfileData?.fotoUrl) {
      return this.originalProfileData.fotoUrl;
    }
    return this.getAvatarPadrao();
  }

  getAvatarPadrao(): string {
    const nome = this.profileForm.get('fullName')?.value || 'Fluxiva Med';
    const iniciais = nome
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
                      <rect width="100" height="100" fill="#007bff"></rect>
                      <text x="50" y="50" font-size="40" dy=".35em" text-anchor="middle" fill="#ffffff" font-family="Poppins, sans-serif">${iniciais}</text>
                    </svg>`;
    return 'data:image/svg+xml;base64,' + btoa(svg);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      if (file.size > 5 * 1024 * 1024) {
        this._snackBar.open('Arquivo muito grande (máx 5MB).', 'Fechar', { duration: 3000 });
        return;
      }

      this.avatarFileToUpload = file;
      if (!this.isEditing) {
        this.toggleEdit(true);
      }
    }
  }

  private populateForm(profile: ProfileResponse): void {
    let especialidadeObj = null;
    let outraEspecialidadeValor = '';

    if (this.isMedico && profile.especialidadeId) {
      especialidadeObj = this.especialidadesDisponiveis.find(
        (e) => e.id === profile.especialidadeId
      );
      if (!especialidadeObj) {
        especialidadeObj = OUTRA_ESPECIALIDADE_PLACEHOLDER;
        outraEspecialidadeValor = profile.especialidadeNome || '';
      }
    }

    this.profileForm.patchValue({
      email: profile.email,
      fullName: profile.fullName,
      telefone: profile.telefone,
      crm: profile.crm,
      especialidade: especialidadeObj,
      outraEspecialidade: outraEspecialidadeValor,
    });
  }

  toggleEdit(editing: boolean): void {
    this.isEditing = editing;
    if (editing) {
      this.profileForm.get('fullName')?.enable();
      this.profileForm.get('telefone')?.enable();
      this.profileForm.get('password')?.enable();
      this.profileForm.get('confirmPassword')?.enable();
      if (this.isMedico) {
        this.profileForm.get('crm')?.enable();
        this.profileForm.get('especialidade')?.enable();
        this.profileForm.get('outraEspecialidade')?.enable();
      }
    } else {
      this.profileForm.disable();
      this.profileForm.get('email')?.disable();
    }
  }

  cancelarEdicao(): void {
    if (this.originalProfileData) {
      this.populateForm(this.originalProfileData);
    }
    this.toggleEdit(false);
    this.avatarFileToUpload = null;
    this.profileForm.get('password')?.reset();
    this.profileForm.get('confirmPassword')?.reset();
  }

  compareEspecialidade(o1: Especialidade | null, o2: Especialidade | null): boolean {
    return o1?.id === o2?.id;
  }

  isOutraEspecialidade(especialidade: Especialidade | null): boolean {
    return !!especialidade && especialidade.id === OUTRA_ESPECIALIDADE_PLACEHOLDER.id;
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    if (this.avatarFileToUpload) {
      this.profileService
        .uploadAvatar(this.avatarFileToUpload)
        .pipe(
          catchError((err: HttpErrorResponse) => {
            this.isLoading = false;
            this._snackBar.open(err.error?.message || 'Erro ao salvar a foto.', 'Fechar', {
              duration: 5000,
              panelClass: ['snackbar-error'],
            });
            return of(null);
          })
        )
        .subscribe((response) => {
          if (response) {
            this.avatarFileToUpload = null;
            this.salvarDadosFormulario(response.fotoUrl);
          }
        });
    } else {
      this.salvarDadosFormulario();
    }
  }

  salvarDadosFormulario(fotoUrl?: string): void {
    const formValue = this.profileForm.getRawValue();

    let especialidadeParaEnviar: Especialidade | null = null;
    if (this.isMedico) {
      const especialidadeSelecionada: Especialidade = formValue.especialidade;
      if (this.isOutraEspecialidade(especialidadeSelecionada)) {
        especialidadeParaEnviar = { id: null, nome: formValue.outraEspecialidade };
      } else {
        especialidadeParaEnviar = especialidadeSelecionada;
      }
    }

    const payload: ProfileUpdateRequest = {
      fullName: formValue.fullName,
      telefone: formValue.telefone || null,
      password: formValue.password || null,
      crm: this.isMedico ? formValue.crm : null,
      especialidade: this.isMedico ? especialidadeParaEnviar : null,
    };

    this.profileService
      .updateMyProfile(payload)
      .pipe(
        finalize(() => {
          if (!this.avatarFileToUpload) {
            this.isLoading = false;
          }
        })
      )
      .subscribe({
        next: (updatedProfile: ProfileResponse) => {
          if (fotoUrl) {
            updatedProfile.fotoUrl = fotoUrl;
          } else if (this.originalProfileData?.fotoUrl) {
            updatedProfile.fotoUrl = this.originalProfileData.fotoUrl;
          }

          this.originalProfileData = updatedProfile;
          this.populateForm(updatedProfile);
          this.toggleEdit(false);
          this.profileForm.get('password')?.reset();
          this.profileForm.get('confirmPassword')?.reset();

          this._snackBar.open('Perfil atualizado com sucesso!', 'Fechar', {
            duration: 3000,
            panelClass: ['snackbar-success'],
          });
        },
        error: (err: HttpErrorResponse) => {
          this._snackBar.open(
            err.error?.message || 'Erro ao atualizar dados do perfil.',
            'Fechar',
            {
              duration: 5000,
              panelClass: ['snackbar-error'],
            }
          );
        },
      });
  }

  cancelar(): void {
    this.router.navigate(['/dashboard/overview']);
  }

  excluirConta(): void {
    if (
      confirm('Deseja mesmo excluir? Para criar novamente, terá que contactar o ADMINISTRADOR.')
    ) {
      this.isLoading = true;
      this.profileService
        .excluirMinhaConta()
        .pipe(finalize(() => (this.isLoading = false)))
        .subscribe({
          next: () => {
            this._snackBar.open('Conta excluída com sucesso.', 'Fechar', { duration: 3000 });
            this.authService.logout();
            this.router.navigate(['/auth/login']);
          },
          error: (err: HttpErrorResponse) => {
            this._snackBar.open(err.error?.message || 'Erro ao excluir conta.', 'Fechar', {
              duration: 5000,
              panelClass: ['snackbar-error'],
            });
          },
        });
    }
  }

  getErrorMessage(controlName: string): string {
    const control = this.profileForm.get(controlName);
    if (control?.hasError('required')) {
      return 'Campo obrigatório.';
    }
    if (control?.hasError('email')) {
      return 'E-mail inválido.';
    }
    if (control?.hasError('minlength')) {
      return 'Senha deve ter no mínimo 6 caracteres.';
    }
    if (control?.hasError('passwordMismatch')) {
      return 'As senhas não conferem.';
    }
    return '';
  }
}
