import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Data, NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit, OnDestroy {
  pageTitle: string = 'FluxivaMed';
  userName: string = 'Usuário';
  unreadAlertsCount: number = 0;
  isProfileMenuOpen: boolean = false;
  private routerSubscription: Subscription | undefined;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.routerSubscription = this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
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
      )
      .subscribe((title: string) => {
        this.pageTitle = title;
      });

    this.loadUserNameFromToken();
    this.unreadAlertsCount = 7;
  }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
  }

  private loadUserNameFromToken(): void {
    const token = this.authService.getAccessToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.userName = payload.fullName || payload.sub || 'Médico';
      } catch (e) {
        console.error('Erro ao decodificar JWT:', e);
        this.userName = 'Usuário Inválido';
      }
    } else {
      this.userName = 'Convidado';
    }
  }

  onAlertsClick(): void {
    this.router.navigate(['/dashboard/alertas']);
    console.log('Botão Alertas clicado!');
  }

  onSettingsClick(): void {
    this.router.navigate(['/dashboard/configuracoes']);
    console.log('Botão Configurações clicado!');
  }

  toggleProfileMenu(): void {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  closeProfileMenu(): void {
    this.isProfileMenuOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (event.target && !this.elementRef.nativeElement.contains(event.target)) {
      this.closeProfileMenu();
    }
  }

  logout(): void {
    this.closeProfileMenu();
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
