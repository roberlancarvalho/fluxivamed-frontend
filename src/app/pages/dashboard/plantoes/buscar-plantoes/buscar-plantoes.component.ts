import { CommonModule, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { Hospital, HospitalService } from '../../../../core/services/hospital.service';
import {
  PageResponse,
  PlantaoResponse,
  PlantaoService,
} from '../../../../core/services/plantao.service';

@Component({
  selector: 'app-buscar-plantoes',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
  ],
  templateUrl: './buscar-plantoes.component.html',
  styleUrl: './buscar-plantoes.component.scss',
  providers: [MessageService, DatePipe],
})
export class BuscarPlantoesComponent implements OnInit {
  filtroForm: FormGroup;
  plantoesPaginados: PageResponse<PlantaoResponse> | null = null;
  hospitais: Hospital[] = [];
  isLoading: boolean = false;

  displayedColumns: string[] = [
    'hospitalNome',
    'especialidade',
    'inicio',
    'fim',
    'valor',
    'status',
    'acoes',
  ];

  constructor(
    private fb: FormBuilder,
    private plantaoService: PlantaoService,
    private hospitalService: HospitalService,
    private snackBar: MatSnackBar,
    private datePipe: DatePipe
  ) {
    this.filtroForm = this.fb.group({
      hospitalId: [''],
      data: [''],
      especialidade: [''],
    });
  }

  ngOnInit(): void {
    this.buscar(0, 10);
    this.loadHospitais();
  }

  loadHospitais(): void {
    this.hospitalService.getHospitais().subscribe((data) => {
      this.hospitais = data;
    });
  }

  buscar(page: number = 0, size: number = 10): void {
    this.isLoading = true;
    const filtros = this.filtroForm.value;

    const dataFormatada = filtros.data ? this.datePipe.transform(filtros.data, 'yyyy-MM-dd') : null;
    const filtrosFormatados = {
      ...filtros,
      data: dataFormatada,
    };

    this.plantaoService
      .buscarPlantoesDisponiveis(filtrosFormatados, page, size)
      .pipe(
        finalize(() => (this.isLoading = false)),
        catchError((err: HttpErrorResponse) => {
          this.snackBar.open('Erro ao buscar plantões.', 'Fechar', { duration: 3000 });
          return of(null);
        })
      )
      .subscribe((pagina) => {
        if (pagina) {
          this.plantoesPaginados = pagina;
        } else {
          this.plantoesPaginados = null;
        }
      });
  }

  onFiltroSubmit(): void {
    this.buscar();
  }

  onPageChange(event: PageEvent): void {
    this.buscar(event.pageIndex, event.pageSize);
  }

  onCandidatarSe(plantaoId: number): void {
    if (!plantaoId) {
      console.error('ID do plantão não fornecido.');
      return;
    }

    this.isLoading = true;
    this.plantaoService
      .candidatarPlantao(plantaoId)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (plantaoAtualizado: PlantaoResponse) => {
          this.snackBar.open(`Candidatura enviada com sucesso!`, 'Fechar', { duration: 3000 });
          this.buscar(this.plantoesPaginados?.number || 0, this.plantoesPaginados?.size || 10);
        },
        error: (err: HttpErrorResponse) => {
          console.error('Erro ao se candidatar ao plantão:', err);
          const errorMessage = err.error?.message || 'Não foi possível enviar a candidatura.';
          this.snackBar.open(errorMessage, 'Fechar', { duration: 3000 });
        },
      });
  }

  getChipColor(status: string): 'primary' | 'accent' | 'warn' | '' {
    switch (status) {
      case 'DISPONIVEL':
        return 'primary';
      case 'AGUARDANDO_APROVACAO':
        return 'accent';
      case 'PREENCHIDO':
        return 'warn';
      case 'REALIZADO':
        return '';
      case 'CANCELADO':
        return '';
      default:
        return '';
    }
  }
}
