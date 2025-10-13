// src/app/layout/header/header.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, NavigationEnd, Router, Data } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  pageTitle: string = 'FluxivaMed';
  userName: string = 'Usuário';

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => {
        let route = this.activatedRoute;
        while (route.firstChild) {
          route = route.firstChild;
        }
        return route.snapshot.data;
      }),
      map((data: Data) => {
        if (data && data['title']) {
          return data['title'];
        }
        return 'Dashboard';
      })
    ).subscribe((title: string) => {
      this.pageTitle = title;
    });

    this.loadUserNameFromToken();
  }

  private loadUserNameFromToken(): void {
    const token = this.authService.getAccessToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1])); 

        this.userName = payload.name || payload.sub || 'Médico';
      } catch (e) {
        console.error('Erro ao decodificar JWT para obter o nome do usuário:', e);
        this.userName = 'Usuário Inválido';
      }
    } else {
      this.userName = 'Convidado';
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}