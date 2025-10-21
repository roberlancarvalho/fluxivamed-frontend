import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MedicoService, PeriodoDisponibilidadeMedico } from '../../../core/services/medico.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-disponibilidade',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatSnackBarModule],
  templateUrl: './disponibilidade.component.html',
  styleUrls: ['./disponibilidade.component.scss'],
})
export class DisponibilidadeComponent implements OnInit {
  disponibilidadeForm: FormGroup;
  periodosSalvos: PeriodoDisponibilidadeMedico[] = [];

  constructor(
    private fb: FormBuilder,
    private medicoService: MedicoService,
    private snackBar: MatSnackBar
  ) {
    this.disponibilidadeForm = this.fb.group({
      periodos: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    this.adicionarPeriodoNoFormulario();
    this.carregarPeriodosSalvos();
  }

  get periodosFormArray(): FormArray {
    return this.disponibilidadeForm.get('periodos') as FormArray;
  }

  criarNovoPeriodoFormGroup(): FormGroup {
    return this.fb.group({
      dataInicio: ['', Validators.required],
      dataFim: ['', Validators.required],
      horaInicio: ['', Validators.required],
      horaFim: ['', Validators.required],
    });
  }

  adicionarPeriodoNoFormulario(): void {
    this.periodosFormArray.push(this.criarNovoPeriodoFormGroup());
  }

  removerPeriodoDoFormulario(index: number): void {
    this.periodosFormArray.removeAt(index);
  }

  carregarPeriodosSalvos(): void {
    this.medicoService.getMinhaDisponibilidade().subscribe(
      (data) => {
        this.periodosSalvos = data.map((p) => ({
          ...p,
          id: p.id,
          dataInicio: new Date(p.inicio),
          dataFim: new Date(p.fim),
        }));
        console.log('Períodos de disponibilidade carregados:', this.periodosSalvos);
      },
      (error) => {
        console.error('Erro ao carregar períodos de disponibilidade:', error);
        this.snackBar.open('Erro ao carregar períodos de disponibilidade.', 'Fechar', {
          duration: 3000,
        });
      }
    );
  }

  salvarDisponibilidade(): void {
    if (this.disponibilidadeForm.invalid) {
      this.snackBar.open('Por favor, preencha todos os campos obrigatórios.', 'Fechar', {
        duration: 3000,
      });
      return;
    }

    const periodosParaEnviar: { inicio: string; fim: string }[] = this.periodosFormArray.value.map(
      (p: any) => {
        const dataInicio = new Date(p.dataInicio);
        const [hInicio, mInicio] = p.horaInicio.split(':').map(Number);
        dataInicio.setHours(hInicio, mInicio);

        const dataFim = new Date(p.dataFim);
        const [hFim, mFim] = p.horaFim.split(':').map(Number);
        dataFim.setHours(hFim, mFim);

        return {
          inicio: dataInicio.toISOString(),
          fim: dataFim.toISOString(),
        };
      }
    );

    this.medicoService.salvarMinhaDisponibilidade(periodosParaEnviar).subscribe(
      () => {
        this.snackBar.open('Disponibilidade salva com sucesso!', 'Fechar', {
          duration: 3000,
        });
        this.disponibilidadeForm.reset();
        this.periodosFormArray.clear();
        this.adicionarPeriodoNoFormulario();
        this.carregarPeriodosSalvos();
      },
      (error) => {
        console.error('Erro ao salvar disponibilidade:', error);
        this.snackBar.open('Erro ao salvar disponibilidade.', 'Fechar', {
          duration: 3000,
        });
      }
    );
  }

  removerPeriodoSalvo(periodoId: number | undefined): void {
    if (!periodoId) {
      this.snackBar.open('ID do período inválido.', 'Fechar', { duration: 3000 });
      return;
    }

    if (!confirm('Tem certeza que deseja remover este período de disponibilidade?')) {
      return;
    }

    this.medicoService.deleteDisponibilidade(periodoId).subscribe({
      next: () => {
        this.snackBar.open('Período removido com sucesso!', 'Fechar', { duration: 3000 });
        this.carregarPeriodosSalvos();
      },
      error: (err: HttpErrorResponse) => {
        console.error('Erro ao remover período:', err);
        this.snackBar.open(err.error?.message || 'Erro ao remover período.', 'Fechar', {
          duration: 3000,
        });
      },
    });
  }
}
