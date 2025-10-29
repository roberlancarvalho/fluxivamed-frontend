import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
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
import { HospitalRequest, HospitalService } from '../../../../core/services/hospital.service';

@Component({
  selector: 'app-criar-hospital',
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
  templateUrl: './criar-hospital.component.html',
  styleUrl: './criar-hospital.component.scss',
})
export class CriarHospitalComponent implements OnInit {
  hospitalForm!: FormGroup;
  isLoading: boolean = false;
  hospitalId: number | null = null;
  isEditMode: boolean = false;

  constructor(
    private fb: FormBuilder,
    private hospitalService: HospitalService,
    private router: Router,
    private route: ActivatedRoute,
    private _snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.hospitalId = this.route.snapshot.params['id']
      ? parseInt(this.route.snapshot.params['id'], 10)
      : null;
    this.isEditMode = !!this.hospitalId;

    this.initForm();

    if (this.isEditMode && this.hospitalId) {
      this.loadHospitalParaEdicao(this.hospitalId);
    }
  }

  initForm(): void {
    this.hospitalForm = this.fb.group({
      nome: ['', Validators.required],
      cnpj: ['', [Validators.required, Validators.minLength(14), Validators.maxLength(18)]],
      endereco: [''],
      telefone1: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(20)]],
      telefone2: ['', [Validators.minLength(10), Validators.maxLength(20)]],
    });
  }

  loadHospitalParaEdicao(id: number): void {
    this.isLoading = true;
    this.hospitalService
      .getHospitalById(id)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (hospital) => {
          this.hospitalForm.patchValue({
            nome: hospital.nome,
            cnpj: hospital.cnpj,
            endereco: hospital.endereco,
            telefone1: hospital.telefone1,
            telefone2: hospital.telefone2,
          });
        },
        error: (err: HttpErrorResponse) => {
          this._snackBar.open(err.error?.message || 'Erro ao carregar hospital.', 'Fechar', {
            duration: 3000,
          });
          this.router.navigate(['/dashboard/hospitais/hospitais']);
        },
      });
  }

  onSubmit(): void {
    if (this.hospitalForm.invalid) {
      this.hospitalForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const hospitalData: HospitalRequest = this.hospitalForm.value;

    const operation = this.isEditMode
      ? this.hospitalService.atualizarHospital(this.hospitalId!, hospitalData)
      : this.hospitalService.criarHospital(hospitalData);

    operation.pipe(finalize(() => (this.isLoading = false))).subscribe({
      next: () => {
        this._snackBar.open(
          `Hospital ${this.isEditMode ? 'atualizado' : 'criado'} com sucesso!`,
          'Fechar',
          {
            duration: 3000,
            panelClass: ['snackbar-success'],
          }
        );
        this.router.navigate(['/dashboard/hospitais']);
      },
      error: (err: HttpErrorResponse) => {
        this._snackBar.open(err.error?.message || 'Erro ao salvar hospital.', 'Fechar', {
          duration: 5000,
          panelClass: ['snackbar-error'],
        });
      },
    });
  }

  cancelar(): void {
    this.router.navigate(['/dashboard/hospitais']);
  }

  getErrorMessage(controlName: string): string {
    const control = this.hospitalForm.get(controlName);
    if (!control) {
      return '';
    }
    if (control.hasError('required')) {
      return 'Campo obrigatório.';
    }
    if (control.hasError('minlength') || control.hasError('maxlength')) {
      if (controlName === 'cnpj') {
        return 'CNPJ inválido (deve ter 14 a 18 caracteres).';
      }
      if (controlName.startsWith('telefone')) {
        return 'Telefone inválido (deve ter 10 a 20 caracteres).';
      }
    }
    return '';
  }
}
