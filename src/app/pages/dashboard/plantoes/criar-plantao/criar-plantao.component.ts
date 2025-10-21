import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { Hospital, HospitalService } from '../../../../core/services/hospital.service';
import {
  PlantaoRequest,
  PlantaoResponse,
  PlantaoService,
} from '../../../../core/services/plantao.service';

@Component({
  selector: 'app-criar-plantao',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ToastModule],
  templateUrl: './criar-plantao.component.html',
  styleUrls: ['./criar-plantao.component.scss'],
  providers: [MessageService],
})
export class CriarPlantaoComponent implements OnInit {
  plantaoForm!: FormGroup;
  hospitais: Hospital[] = [];
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private plantaoService: PlantaoService,
    private hospitalService: HospitalService,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadHospitais();
  }

  initForm(): void {
    this.plantaoForm = this.fb.group(
      {
        hospitalId: ['', Validators.required],
        especialidade: ['', Validators.required],
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
          detail: 'Falha ao carregar hospitais.',
        });
      },
    });
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

    const plantao: PlantaoRequest = {
      hospitalId: parseInt(formValue.hospitalId, 10),
      especialidade: formValue.especialidade,
      inicio: new Date(formValue.inicio).toISOString(),
      fim: new Date(formValue.fim).toISOString(),
      valor: parseFloat(formValue.valor)
    };

    this.plantaoService.criarPlantao(plantao).subscribe({
      next: (response: PlantaoResponse) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Plantão criado com sucesso!',
        });
        this.plantaoForm.reset();
        this.router.navigate(['/dashboard/plantoes']);
      },
      error: (error) => {
        console.error('Erro ao criar plantão:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: error.error?.message || 'Não foi possível criar o plantão.',
        });
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }
}
