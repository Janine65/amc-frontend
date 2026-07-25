import {
  Component,
  DestroyRef,
  OnDestroy,
  Renderer2,
  inject,
  OnInit,
  viewChild,
  ChangeDetectionStrategy
} from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, firstValueFrom } from 'rxjs';
import { LayoutService } from '../service/app.layout.service';
import { AppSidebarComponent } from './app.sidebar.component';
import { AppTopBarComponent } from './app.topbar.component';
import { MessageService } from 'primeng/api';
import { NgClass } from '@angular/common';
import { AlertComponent } from '../components/shared/alert/alert.component';
import { AppFooterComponent } from './app.footer.component';

@Component({
  selector: 'app-layout',
  templateUrl: './app.layout.component.html',
  providers: [MessageService],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    NgClass,
    AppTopBarComponent,
    AppSidebarComponent,
    AlertComponent,
    RouterOutlet,
    AppFooterComponent,
  ],
})
export class AppLayoutComponent implements OnDestroy {
  layoutService = inject(LayoutService);
  renderer = inject(Renderer2);
  router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  menuOutsideClickListener: (() => void) | null = null;

  profileMenuOutsideClickListener: (() => void) | null = null;

  readonly appSidebar = viewChild.required(AppSidebarComponent);

  readonly appTopbar = viewChild.required(AppTopBarComponent);

  constructor() {
    this.layoutService.overlayOpen$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (!this.menuOutsideClickListener) {
          this.menuOutsideClickListener = this.renderer.listen(
            'document',
            'click',
            (event) => {
              const appSidebar = this.appSidebar();
              const appTopbar = this.appTopbar();
              const menuButton = appTopbar.menuButton();
              const isOutsideClicked = !(
                appSidebar.el.nativeElement.isSameNode(event.target) ||
                appSidebar.el.nativeElement.contains(event.target) ||
                menuButton.nativeElement.isSameNode(event.target) ||
                menuButton.nativeElement.contains(event.target)
              );

              if (isOutsideClicked) {
                this.hideMenu();
              }
            },
          );
        }

        if (!this.profileMenuOutsideClickListener) {
          this.profileMenuOutsideClickListener = this.renderer.listen(
            'document',
            'click',
            (event) => {
              const appTopbar = this.appTopbar();
              const menu = appTopbar.menu();
              const isOutsideClicked = !(
                menu.nativeElement.isSameNode(event.target) ||
                menu.nativeElement.contains(event.target)
              );

              if (isOutsideClicked) {
                this.hideProfileMenu();
              }
            },
          );
        }

        if (this.layoutService.state.staticMenuMobileActive) {
          this.blockBodyScroll();
        }
      });

    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.hideMenu();
        this.hideProfileMenu();
      });

    window.addEventListener('mousedown', () => {
      this.layoutService.userActiveSince = new Date();
    });
  }

  hideMenu() {
    this.layoutService.state.overlayMenuActive = false;
    this.layoutService.state.staticMenuMobileActive = false;
    this.layoutService.state.menuHoverActive = false;
    if (this.menuOutsideClickListener) {
      this.menuOutsideClickListener();
      this.menuOutsideClickListener = null;
    }
    this.unblockBodyScroll();
  }

  hideProfileMenu() {
    this.layoutService.state.profileSidebarVisible = false;
    if (this.profileMenuOutsideClickListener) {
      this.profileMenuOutsideClickListener();
      this.profileMenuOutsideClickListener = null;
    }
  }

  blockBodyScroll(): void {
    if (document.body.classList) {
      document.body.classList.add('blocked-scroll');
    } else {
      document.body.className += ' blocked-scroll';
    }
  }

  unblockBodyScroll(): void {
    if (document.body.classList) {
      document.body.classList.remove('blocked-scroll');
    } else {
      document.body.className = document.body.className.replace(
        new RegExp(
          '(^|\\b)' + 'blocked-scroll'.split(' ').join('|') + '(\\b|$)',
          'gi',
        ),
        ' ',
      );
    }
  }

  get containerClass() {
    return {
      'layout-theme-light': this.layoutService.config.colorScheme === 'light',
      'layout-theme-dark': this.layoutService.config.colorScheme === 'dark',
      'layout-overlay': this.layoutService.config.menuMode === 'overlay',
      'layout-static': this.layoutService.config.menuMode === 'static',
      'layout-static-inactive':
        this.layoutService.state.staticMenuDesktopInactive &&
        this.layoutService.config.menuMode === 'static',
      'layout-overlay-active': this.layoutService.state.overlayMenuActive,
      'layout-mobile-active': this.layoutService.state.staticMenuMobileActive,
      'p-input-filled': this.layoutService.config.inputStyle === 'filled',
      'p-ripple-disabled': !this.layoutService.config.ripple,
    };
  }

  ngOnDestroy() {
    if (this.menuOutsideClickListener) {
      this.menuOutsideClickListener();
    }
  }
}
