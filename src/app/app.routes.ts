import { Routes } from '@angular/router';
import { AuthComponent } from './auth/auth/auth.component';
import { LoginComponent } from './auth/login/login.component';
import { authGuard } from './core/guards/auth-guard';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { OverviewComponent } from './pages/dashboard/overview/overview.component';
import { BuscarPlantoesComponent } from './pages/dashboard/plantoes/buscar-plantoes/buscar-plantoes.component';
import { PlantaoListComponent } from './pages/dashboard/plantoes/plantao-list/plantao-list.component';

export const routes: Routes = [
  { path: '', redirectTo: '/auth/login', pathMatch: 'full' },

  {
    path: 'auth',
    component: AuthComponent,
    children: [
      { path: 'login', component: LoginComponent, title: 'FluxivaMed' },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },

  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: 'overview', component: OverviewComponent, title: 'FluxivaMed - Visão Geral' },
      { path: 'plantoes', component: PlantaoListComponent, title: 'FluxivaMed - Meus Plantões' },
      {
        path: 'buscar-plantoes',
        component: BuscarPlantoesComponent,
        title: 'FluxivaMed - Buscar Plantões',
      },
    ],
  },
  { path: '**', redirectTo: '/auth/login' },
];
