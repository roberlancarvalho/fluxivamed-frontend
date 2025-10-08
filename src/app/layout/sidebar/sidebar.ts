import {
  Component,
  ElementRef,
  Renderer2,
  ViewChildren,
  QueryList,
  Output,
  EventEmitter,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.scss'],
})
export class SidebarComponent {
  isCollapsed: boolean = false;
  activeDropdown: string | null = null;

  @ViewChildren('submenuRef') submenus!: QueryList<ElementRef>;

  @Output() sidebarToggled = new EventEmitter<boolean>();

  constructor(private router: Router, private renderer: Renderer2) {}

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
    if (this.isCollapsed) {
      this.activeDropdown = null;
      this.closeAllSubmenus();
    }
    this.sidebarToggled.emit(this.isCollapsed);
  }

  toggleDropdown(dropdownName: string, event: Event): void {
    event.stopPropagation();

    if (this.isCollapsed) return;

    if (this.activeDropdown === dropdownName) {
      this.activeDropdown = null;
    } else {
      this.activeDropdown = dropdownName;
    }

    this.submenus.forEach((submenuElement) => {
      const parentLi = this.renderer.parentNode(submenuElement.nativeElement);
      const dataDropdownName = parentLi.getAttribute('data-dropdown-name');
      const isCurrentDropdown = dataDropdownName === dropdownName;

      if (isCurrentDropdown && this.activeDropdown === dropdownName) {
        this.renderer.setStyle(
          submenuElement.nativeElement,
          'max-height',
          submenuElement.nativeElement.scrollHeight + 'px'
        );
      } else {
        this.renderer.setStyle(submenuElement.nativeElement, 'max-height', '0');
      }
    });
  }

  closeAllSubmenus(): void {
    this.submenus.forEach((submenuElement) => {
      this.renderer.setStyle(submenuElement.nativeElement, 'max-height', '0');
    });
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    this.router.navigate(['/login']);
  }
}
