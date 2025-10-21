import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Data, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  appTitlePrefix: string = 'FluxivaMed';
  isLoggedIn: boolean = false;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private titleService: Title,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.isLoggedIn$().subscribe((loggedIn: boolean) => {
      this.isLoggedIn = loggedIn;
    });

    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        map(() => {
          let child = this.activatedRoute.firstChild;
          while (child) {
            if (child.firstChild) {
              child = child.firstChild;
            } else {
              return child.snapshot.data;
            }
          }
          return {};
        }),
        map((data: Data) => {
          if (data && data['title']) {
            return data['title'];
          }
          return 'Sistema';
        })
      )
      .subscribe((pageTitle: string) => {
        this.titleService.setTitle(`${this.appTitlePrefix} - ${pageTitle}`);
      });
  }
}
