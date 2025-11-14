import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, HostListener } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';

import { MatDialog } from '@angular/material/dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle'; // Importar
import { MatBadgeModule } from '@angular/material/badge'; // Importar
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatSlideToggleModule, // Adicionar
    MatBadgeModule // Adicionar
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit, OnDestroy {
  isLoggedIn: boolean = false;
  userEmail: string | null = null;
  userName: string | null = null;
  unreadNotificationsCount: number = 0;

  isProfileMenuOpen: boolean = false;
  isSettingsMenuOpen: boolean = false;

  // Configurações (com valores padrão)
  currentTheme: 'light' | 'dark' = 'light';
  receberEmailAprovacao: boolean = true;
  // ... (outras configurações) ...

  private authSubscription: Subscription | null = null;
  private notificationsSubscription: Subscription | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService,
    public dialog: MatDialog
  ) { }

  // Fecha os menus se clicar fora deles
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    this.isProfileMenuOpen = false;
    this.isSettingsMenuOpen = false;
  }

  ngOnInit(): void {
    this.authSubscription = this.authService.isLoggedIn$().subscribe((loggedIn) => {
      this.isLoggedIn = loggedIn;
      if (loggedIn) {
        this.userName = this.authService.getUserFullName();
        this.userEmail = this.authService.getCurrentUserEmail();
        this.notificationService.connect();
      } else {
        this.userEmail = null;
        this.userName = null;
        this.notificationService.disconnect();
      }
    });

    this.notificationsSubscription = this.notificationService.unreadCount$.subscribe(
      (count) => {
        this.unreadNotificationsCount = count;
      }
    );

    this.loadUserSettings();
  }

  ngOnDestroy(): void {
    this.authSubscription?.unsubscribe();
    this.notificationsSubscription?.unsubscribe();
  }

  logout(): void {
    this.closeAllMenus();
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  closeAllMenus(): void {
    this.isProfileMenuOpen = false;
    this.isSettingsMenuOpen = false;
  }

  toggleProfileMenu(): void {
    this.isSettingsMenuOpen = false; // Fecha o outro menu
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  toggleSettingsMenu(): void {
    this.isProfileMenuOpen = false; // Fecha o outro menu
    this.isSettingsMenuOpen = !this.isSettingsMenuOpen;
  }

  markAllAsRead(): void {
    this.notificationService.resetUnreadCount();
  }

  // --- Lógica de Configurações ---

  loadUserSettings(): void {
    // TODO: Carregar do backend (ProfileService)
    const storedSettings = JSON.parse(localStorage.getItem('userSettings') || '{}');
    this.currentTheme = storedSettings.tema ?? 'light';
    this.receberEmailAprovacao = storedSettings.receberEmailAprovacao ?? true;
    this.applyTheme(this.currentTheme);
  }

  saveUserSettings(): void {
    // TODO: Salvar no backend (ProfileService)
    const settings = {
      tema: this.currentTheme,
      receberEmailAprovacao: this.receberEmailAprovacao
    };
    localStorage.setItem('userSettings', JSON.stringify(settings));
  }

  changeTheme(theme: 'light' | 'dark'): void {
    this.currentTheme = theme;
    this.applyTheme(theme);
    this.saveUserSettings();
  }

  applyTheme(theme: 'light' | 'dark'): void {
    document.body.classList.remove('light-theme', 'dark-theme');
    document.body.classList.add(`${theme}-theme`);
  }

  toggleNotificacao(tipo: string, checked: boolean): void {
    if (tipo === 'receberEmailAprovacao') {
      this.receberEmailAprovacao = checked;
    }
    // ... (outras lógicas) ...
    this.saveUserSettings();
  }
}