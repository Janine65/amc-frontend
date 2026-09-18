import {
  Component,
  DestroyRef,
  OnChanges,
  OnInit,
  inject,
  signal,
  ChangeDetectionStrategy
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LayoutService } from '../service/app.layout.service';
import { MenuItem, MessageService } from 'primeng/api';
import { AccountService } from '@service/account.service';
import { User } from '@model/user';
import { Router } from '@angular/router';
import { AppMenuitemComponent } from './app.menuitem.component';

@Component({
  selector: 'app-menu',
  templateUrl: './app.menu.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [AppMenuitemComponent],
})
export class AppMenuComponent implements OnInit, OnChanges {
  layoutService = inject(LayoutService);
  private router = inject(Router);
  private messages = inject(MessageService);
  private accountService = inject(AccountService);
  private readonly destroyRef = inject(DestroyRef);

  public readonly model = signal<MenuItem[]>([]);
  ngOnChanges(): void {
    this.refreshMenu(this.accountService.userValue);
  }

  ngOnInit() {
    this.refreshMenu(this.accountService.userValue);
    this.accountService.userSubject
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((user) => this.refreshMenu(user));
  }

  refreshMenu(user: User | undefined) {
    const userMenu = [];
    if (this.isLoggedIn()) {
      userMenu.push(
        {
          label: 'Ausloggen',
          icon: 'pi pi-sign-out',
          command: async () => {
            await this.loggoutUser();
          },
        },
        {
          label: 'Mein Profil',
          icon: 'pi pi-user-edit',
          routerLink: ['/account/profile'],
        },
        {
          label: 'Alle gespeicherten Einstellung löschen',
          icon: 'pi pi-trash',
          command: () => {
            this.clearStorage();
          },
        },
      );

      if (this.accountService.userValue.role === 'admin')
        userMenu.push({
          label: 'Users',
          icon: 'pi pi-fw pi-users',
          routerLink: ['/users'],
        });
    }

    const model: MenuItem[] = [
      {
        label: '',
        items: [
          { label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/'] },
        ],
      },
    ];

    if (user?.role) {
      if (user.role === 'user' || user.role === 'admin') {
        model.push(
          {
            label: 'Verwaltung',
            items: [
              {
                label: 'Adressen',
                icon: 'pi pi-fw pi-id-card',
                routerLink: ['/verwaltung/adressen'],
              },
              {
                label: 'Anlässe',
                icon: 'pi pi-fw pi-calendar',
                routerLink: ['/verwaltung/anlaesse'],
              },
              user.role === 'admin'
                ? {
                    label: 'Parameters',
                    icon: 'pi pi-fw pi-bookmark',
                    routerLink: ['/verwaltung/parameter'],
                  }
                : { visible: false },
            ],
          },
          {
            label: 'Auswertungen',
            items: [
              {
                label: 'Meisterschaft',
                icon: 'pi pi-fw pi-map',
                routerLink: ['/auswertung/meisterschaft'],
              },
              {
                label: 'Auswertungen',
                icon: 'pi pi-fw pi-chart-bar',
                routerLink: ['/auswertung/auswertung'],
              },
            ],
          },
          {
            label: 'Homepage',
            items: [
              {
                label: 'News',
                icon: 'pi pi-fw pi-megaphone',
                routerLink: ['/homepage/news'],
              },
              {
                label: 'Berichte',
                icon: 'pi pi-fw pi-file-edit',
                routerLink: ['/homepage/berichte'],
              },
              {
                label: 'Anmeldungen',
                icon: 'pi pi-fw pi-user-plus',
                routerLink: ['/homepage/anmeldungen'],
              },
              user.role === 'admin'
                ? {
                    label: 'Jahr-Freigabe',
                    icon: 'pi pi-fw pi-unlock',
                    routerLink: ['/homepage/freigabe'],
                  }
                : { visible: false },
            ],
          },
        );
      }
      model.push({
        label: 'Buchhaltung',
        items: [
          user.role === 'admin' || user.role === 'revisor'
            ? {
                label: 'Journal',
                icon: 'pi pi-fw pi-money-bill',
                routerLink: ['/buchhaltung/journal'],
              }
            : { visible: false },
          user.role === 'admin' || user.role === 'user'
            ? {
                label: 'Kegelkasse',
                icon: 'pi pi-dollar',
                routerLink: ['/buchhaltung/kegelkasse'],
              }
            : { visible: false },
          user.role === 'admin' || user.role === 'revisor'
            ? {
                label: 'Auswertung',
                icon: 'pi pi-fw pi-percentage',
                routerLink: ['/buchhaltung/kto-auswertung'],
              }
            : { visible: false },
          user.role === 'admin'
            ? {
                label: 'Geschäftsjahr',
                icon: 'pi pi-fw pi-book',
                routerLink: ['/buchhaltung/geschaeftsjahr'],
              }
            : { visible: false },
          user.role === 'admin'
            ? {
                label: 'Budget',
                disabled: true,
                icon: 'pi pi-fw pi-calculator',
                routerLink: ['/buchhaltung/budget'],
              }
            : { visible: false },
          user.role === 'admin'
            ? {
                label: 'Konten',
                icon: 'pi pi-fw pi-bitcoin',
                routerLink: ['/buchhaltung/konten'],
              }
            : { visible: false },
        ],
      });
      model.push({ separator: true });
    }
    if (userMenu.length > 0)
      model.push({
        label: 'User',
        items: userMenu,
      });
    else
      model.push({
        label: '',
        items: [
          {
            label: 'Anmelden',
            icon: 'pi pi-sign-in',
            command: () => {
              this.clickUser();
            },
          },
        ],
      });

    this.model.set(model);
  }

  async clickUser() {
    if (this.isLoggedIn()) {
      return;
    } else {
      await this.router.navigateByUrl('/account/login');
    }
  }

  async loggoutUser() {
    if (this.isLoggedIn()) {
      await this.accountService.logout();
      this.messages.add({
        detail: 'Du bist ausgelogged!',
        summary: 'Ausgelogged',
        severity: 'info',
        closable: true,
        sticky: false,
      });
    }
  }

  clearStorage() {
    localStorage.clear();
  }

  public isLoggedIn(): boolean {
    if (this.accountService.userValue.id) {
      return true;
    }
    return false;
  }
  public getLoggedinUser() {
    if (this.isLoggedIn()) return this.accountService.userValue.name;

    return 'not logged in';
  }
}
