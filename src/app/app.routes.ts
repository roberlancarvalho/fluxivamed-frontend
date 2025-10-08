import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login';

import { authGuard } from './auth/auth-guard';
import { Overview } from './pages/dashboard/overview/overview';
import { DashboardComponent } from './pages/dashboard/dashboard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
      path: 'dashboard',
      component: DashboardComponent,
      canActivate: [authGuard],
      children: [
        { path: '', redirectTo: 'overview', pathMatch: 'full' },
        { path: 'overview', component: Overview },
        // { path: 'meus-plantoes', component: MeusPlantoesComponent }, // Exemplo futuro
        // { path: 'perfil', component: PerfilComponent }, // Exemplo futuro
      ]
    }
];
