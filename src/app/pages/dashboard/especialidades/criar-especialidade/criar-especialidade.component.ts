import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import {
  EspecialidadeRequest,
  EspecialidadeService,
} from '../../../../core/services/especialidade.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-criar-especialidade',
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
  ],
  templateUrl: './criar-especialidade.component.html',
  styleUrl: './criar-especialidade.component.scss',
})
export class CriarEspecialidadeComponent implements OnInit {
  especialidadeForm!: FormGroup;
  isLoading: boolean = false;
  especialidadeId: number | null = null;
  isEditMode: boolean = false;

  constructor(
    private fb: FormBuilder,
    private especialidadeService: EspecialidadeService,
    private router: Router,
    private route: ActivatedRoute,
    private _snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.especialidadeId = this.route.snapshot.params['id']
      ? parseInt(this.route.snapshot.params['id'], 10)
      : null;
    this.isEditMode = !!this.especialidadeId;

    this.initForm();

    if (this.isEditMode && this.especialidadeId) {
      this.loadEspecialidadeParaEdicao(this.especialidadeId);
    }
  }

  initForm(): void {
    this.especialidadeForm = this.fb.group({
      nome: ['', Validators.required],
    });
  }

  loadEspecialidadeParaEdicao(id: number): void {
    this.isLoading = true;
    this.especialidadeService
      .getEspecialidadeById(id)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (especialidade) => {
          this.especialidadeForm.patchValue({
            nome: especialidade.nome,
          });
        },
        error: (err: HttpErrorResponse) => {
          this._snackBar.open(err.error?.message || 'Erro ao carregar especialidade.', 'Fechar', {
            duration: 3000,
          });
          this.router.navigate(['/dashboard/especialidades']);
        },
      });
  }

  onSubmit(): void {
    if (this.especialidadeForm.invalid) {
      this.especialidadeForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const especialidadeData: EspecialidadeRequest = this.especialidadeForm.value;

    const operation = this.isEditMode
      ? this.especialidadeService.atualizarEspecialidade(this.especialidadeId!, especialidadeData)
      : this.especialidadeService.criarEspecialidade(especialidadeData);

    operation.pipe(finalize(() => (this.isLoading = false))).subscribe({
      next: () => {
        this._snackBar.open(
          `Especialidade ${this.isEditMode ? 'atualizada' : 'criada'} com sucesso!`,
          'Fechar',
          {
            duration: 3000,
            panelClass: ['snackbar-success'],
          }
        );
        this.router.navigate(['/dashboard/especialidades']);
      },
      error: (err: HttpErrorResponse) => {
        this._snackBar.open(err.error?.message || 'Erro ao salvar especialidade.', 'Fechar', {
          duration: 5000,
          panelClass: ['snackbar-error'],
        });
      },
    });
  }

  cancelar(): void {
    this.router.navigate(['/dashboard/especialidades']);
  }

  getErrorMessage(controlName: string): string {
    const control = this.especialidadeForm.get(controlName);
    if (control?.hasError('required')) {
      return 'Nome é obrigatório.';
    }
    return '';
  }
}
