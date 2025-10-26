import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import {
  AdminStats,
  DashboardService,
  MedicoStats,
} from '../../../core/services/dashboard.service';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.scss',
})
export class OverviewComponent implements OnInit {
  isLoading = true;
  isMedico = false;
  isAdminOrEscalista = false;

  adminStats: AdminStats | null = null;
  medicoStats: MedicoStats | null = null;
  userName: string = '';

  constructor(private authService: AuthService, private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.userName = this.authService.getUserName() || 'Usuário';
    this.isMedico = this.authService.hasRole('MEDICO');
    this.isAdminOrEscalista =
      this.authService.hasRole('ADMIN') ||
      this.authService.hasRole('HOSPITAL_ADMIN') ||
      this.authService.hasRole('ESCALISTA');

    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    if (this.isAdminOrEscalista) {
      this.dashboardService.getAdminStats().subscribe((data) => {
        this.adminStats = data;
        this.isLoading = false;
      });
    } else if (this.isMedico) {
      this.dashboardService.getMedicoStats().subscribe((data) => {
        this.medicoStats = data;
        this.isLoading = false;
      });
    } else {
      this.isLoading = false;
    }
  }
}
