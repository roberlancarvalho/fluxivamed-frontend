import { Routes } from '@angular/router';
import { AuthComponent } from './auth/auth/auth.component';
import { LoginComponent } from './auth/login/login.component';
import { authGuard } from './core/guards/auth-guard';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { DisponibilidadeComponent } from './pages/dashboard/disponibilidade/disponibilidade.component';
import { CriarMedicoComponent } from './pages/dashboard/medicos/criar-medico.component';
import { OverviewComponent } from './pages/dashboard/overview/overview.component';
import { BuscarPlantoesComponent } from './pages/dashboard/plantoes/buscar-plantoes/buscar-plantoes.component';
import { CriarPlantaoComponent } from './pages/dashboard/plantoes/criar-plantao/criar-plantao.component';
import { PlantaoDetalhesComponent } from './pages/dashboard/plantoes/plantao-detalhes/plantao-detalhes.component';
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
      {
        path: 'plantoes/meus-plantoes',
        component: PlantaoListComponent,
        title: 'FluxivaMed - Meus Plantões',
        canActivate: [authGuard],
        data: { roles: ['MEDICO', 'ADMIN', 'HOSPITAL_ADMIN', 'ESCALISTA'] },
      },
      {
        path: 'plantoes/disponiveis',
        component: BuscarPlantoesComponent,
        title: 'FluxivaMed - Buscar Plantões',
        canActivate: [authGuard],
        data: { roles: ['MEDICO'] },
      },
      {
        path: 'disponibilidade',
        component: DisponibilidadeComponent,
        title: 'FluxivaMed - Minha Disponibilidade',
        canActivate: [authGuard],
        data: { roles: ['MEDICO'] },
      },
      {
        path: 'plantoes/criar',
        component: CriarPlantaoComponent,
        title: 'FluxivaMed - Criar Plantão',
        canActivate: [authGuard],
        data: { roles: ['ADMIN', 'HOSPITAL_ADMIN', 'ESCALISTA'] },
      },
      {
        path: 'plantoes/editar/:id',
        component: CriarPlantaoComponent,
        title: 'FluxivaMed - Editar Plantão',
        canActivate: [authGuard],
        data: { roles: ['ADMIN', 'HOSPITAL_ADMIN', 'ESCALISTA'] },
      },
      {
        path: 'plantoes/:id',
        component: PlantaoDetalhesComponent,
        title: 'FluxivaMed - Detalhes do Plantão',
        canActivate: [authGuard],
        data: { roles: ['ADMIN', 'HOSPITAL_ADMIN', 'ESCALISTA', 'MEDICO'] },
      },
      {
        path: 'medicos/criar',
        component: CriarMedicoComponent,
        title: 'FluxivaMed - Adicionar Médico',
        canActivate: [authGuard],
        data: { roles: ['ADMIN', 'HOSPITAL_ADMIN'] },
      },
      {
        path: 'medicos/editar/:id',
        component: CriarMedicoComponent,
        title: 'FluxivaMed - Editar Médico',
        canActivate: [authGuard],
        data: { roles: ['ADMIN', 'HOSPITAL_ADMIN'] },
      },
    ],
  },
  { path: '**', redirectTo: '/auth/login' },
];
