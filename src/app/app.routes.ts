import { Routes } from '@angular/router';
import { AuthComponent } from './auth/auth/auth.component';
import { LoginComponent } from './auth/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { authGuard } from './core/guards/auth-guard';
import { OverviewComponent } from './pages/dashboard/overview/overview.component';
import { PlantaoListComponent } from './pages/dashboard/plantoes/plantao-list.component/plantao-list.component';

export const routes: Routes = [
  { path: '', redirectTo: '/auth/login', pathMatch: 'full' },

  {
    path: 'auth',
    component: AuthComponent,
    children: [
      { path: 'login', component: LoginComponent, title: 'Acesso ao Sistema' },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },

  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: 'overview', component: OverviewComponent, title: 'Visão Geral' },
      { path: 'plantoes', component: PlantaoListComponent, title: 'Meus Plantões' },
    ],
  },
  { path: '**', redirectTo: '/auth/login' },
];
