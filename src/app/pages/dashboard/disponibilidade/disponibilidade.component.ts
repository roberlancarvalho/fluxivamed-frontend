import { CommonModule, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable, tap } from 'rxjs';
import { MedicoService, PeriodoDisponibilidadeMedico } from '../../../core/services/medico.service';

@Component({
  selector: 'app-disponibilidade',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePipe],
  templateUrl: './disponibilidade.component.html',
  styleUrls: ['./disponibilidade.component.scss'],
})
export class DisponibilidadeComponent implements OnInit {
  disponibilidadeForm: FormGroup;
  disponibilidadesAtuais$!: Observable<PeriodoDisponibilidadeMedico[]>;

  constructor(private fb: FormBuilder, private medicoService: MedicoService) {
    this.disponibilidadeForm = this.fb.group({
      periodos: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    this.carregarDisponibilidades();
    this.adicionarPeriodo();
  }

  get periodos(): FormArray {
    return this.disponibilidadeForm.get('periodos') as FormArray;
  }

  novoPeriodoFormGroup(): FormGroup {
    return this.fb.group({
      dataInicio: ['', Validators.required],
      dataFim: ['', Validators.required],
      horaInicio: ['', Validators.required],
      horaFim: ['', Validators.required],
    });
  }

  adicionarPeriodo(): void {
    this.periodos.push(this.novoPeriodoFormGroup());
  }

  removerPeriodo(index: number): void {
    this.periodos.removeAt(index);
  }

  carregarDisponibilidades(): void {
    this.disponibilidadesAtuais$ = this.medicoService.getMinhaDisponibilidade();
  }

  salvarDisponibilidade(): void {
    if (this.disponibilidadeForm.invalid) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      this.disponibilidadeForm.markAllAsTouched();
      return;
    }

    const formPeriodos = this.disponibilidadeForm.value.periodos;

    const payload: PeriodoDisponibilidadeMedico[] = formPeriodos.map((p: any) => {
      const inicioISO = `${p.dataInicio}T${p.horaInicio}:00`;
      const fimISO = `${p.dataFim}T${p.horaFim}:00`;

      return {
        inicio: inicioISO,
        fim: fimISO,
      };
    });

    this.medicoService
      .salvarMinhaDisponibilidade(payload)
      .pipe(
        tap(() => {
          this.periodos.clear();
          this.adicionarPeriodo();
          this.carregarDisponibilidades();
          alert('Disponibilidade salva com sucesso!');
        })
      )
      .subscribe({
        error: (err: HttpErrorResponse) => {
          console.error('Erro ao salvar disponibilidade:', err);
          let errorMessage = 'Erro ao salvar. Tente novamente.';
          if (err.error && typeof err.error === 'object' && err.error.message) {
            errorMessage = `Erro: ${err.error.message}`;
          } else if (err.status === 400) {
            errorMessage = 'Verifique os dados. Ocorreu um erro de validação.';
          } else if (err.message) {
            errorMessage = `Erro de rede: ${err.message}`;
          }
          alert(errorMessage);
        },
      });
  }
}
