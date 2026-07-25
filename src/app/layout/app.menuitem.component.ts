import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  HostBinding,
  Input,
  OnInit,
  inject,
  input,
  ChangeDetectionStrategy
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  NavigationEnd,
  Router,
  RouterLinkActive,
  RouterLink,
} from '@angular/router';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { filter } from 'rxjs/operators';
import { MenuItem } from 'primeng/api';
import { MenuService } from './app.menu.service';
import { LayoutService } from '../service/app.layout.service';
import { Ripple } from 'primeng/ripple';
import { NgClass } from '@angular/common';

export interface AppMenuItem extends MenuItem {
  class?: string;
  badgeClass?: string;
  items?: AppMenuItem[];
}

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: '[app-menuitem]',
  template: `
    <ng-container>
      @if (root && item.visible !== false) {
        <div class="layout-menuitem-root-text">{{ item.label }}</div>
      }
      @if ((!item.routerLink || item.items) && item.visible !== false) {
        <a
          [attr.href]="item.url"
          (click)="itemClick($event)"
          [ngClass]="item.class"
          [attr.target]="item.target"
          tabindex="0"
          pRipple
        >
          <i [ngClass]="item.icon" class="layout-menuitem-icon"></i>
          <span class="layout-menuitem-text">{{ item.label }}</span>
          @if (item.items) {
            <i class="pi pi-fw pi-angle-down layout-submenu-toggler"></i>
          }
        </a>
      }
      @if (item.routerLink && !item.items && item.visible !== false) {
        <a
          (click)="itemClick($event)"
          [ngClass]="item.class"
          [routerLink]="item.routerLink"
          routerLinkActive="active-route"
          [routerLinkActiveOptions]="
            item.routerLinkActiveOptions || {
              paths: 'exact',
              queryParams: 'ignored',
              matrixParams: 'ignored',
              fragment: 'ignored',
            }
          "
          [fragment]="item.fragment"
          [queryParamsHandling]="item.queryParamsHandling"
          [preserveFragment]="item.preserveFragment"
          [skipLocationChange]="item.skipLocationChange"
          [replaceUrl]="item.replaceUrl"
          [state]="item.state"
          [queryParams]="item.queryParams"
          [attr.target]="item.target"
          tabindex="0"
          pRipple
        >
          <i [ngClass]="item.icon" class="layout-menuitem-icon"></i>
          <span class="layout-menuitem-text">{{ item.label }}</span>
          @if (item.items) {
            <i class="pi pi-fw pi-angle-down layout-submenu-toggler"></i>
          }
        </a>
      }

      @if (item.items && item.visible !== false) {
        <ul [@children]="submenuAnimation">
          @for (child of item.items; track child; let i = $index) {
            <li
              app-menuitem
              [item]="child"
              [index]="i"
              [parentKey]="key"
              [class]="child.badgeClass"
            ></li>
          }
        </ul>
      }
    </ng-container>
  `,
  animations: [
    trigger('children', [
      state(
        'collapsed',
        style({
          height: '0',
        }),
      ),
      state(
        'expanded',
        style({
          height: '*',
        }),
      ),
      transition(
        'collapsed <=> expanded',
        animate('400ms cubic-bezier(0.86, 0, 0.07, 1)'),
      ),
    ]),
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [Ripple, NgClass, RouterLinkActive, RouterLink],
})
export class AppMenuitemComponent implements OnInit {
  layoutService = inject(LayoutService);
  private cd = inject(ChangeDetectorRef);
  router = inject(Router);
  private menuService = inject(MenuService);
  private readonly destroyRef = inject(DestroyRef);

  @Input() item!: AppMenuItem;

  readonly index = input.required<number>();

  @Input() @HostBinding('class.layout-root-menuitem') root!: boolean;

  readonly parentKey = input<string>('');

  active = false;

  key = '';

  constructor() {
    this.menuService.menuSource$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        Promise.resolve(null).then(() => {
          if (value.routeEvent) {
            this.active =
              value.key === this.key || value.key.startsWith(this.key + '-')
                ? true
                : false;
          } else {
            if (
              value.key !== this.key &&
              !value.key.startsWith(this.key + '-')
            ) {
              this.active = false;
            }
          }
        });
      });

    this.menuService.resetSource$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.active = false;
      });

    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        if (this.item.routerLink) {
          this.updateActiveStateFromRoute();
        }
      });
  }

  ngOnInit() {
    const parentKey = this.parentKey();
    this.key = parentKey
      ? parentKey + '-' + this.index()
      : String(this.index());

    if (this.item.routerLink) {
      this.updateActiveStateFromRoute();
    }
  }

  updateActiveStateFromRoute() {
    const activeRoute = this.router.isActive(this.item.routerLink[0], {
      paths: 'exact',
      queryParams: 'ignored',
      matrixParams: 'ignored',
      fragment: 'ignored',
    });

    if (activeRoute) {
      this.menuService.onMenuStateChange({ key: this.key, routeEvent: true });
    }
  }

  itemClick(event: Event) {
    // avoid processing disabled items
    if (this.item.disabled) {
      event.preventDefault();
      return;
    }

    // execute command
    if (this.item.command) {
      this.item.command({ originalEvent: event, item: this.item });
    }

    // toggle active state
    if (this.item.items) {
      this.active = !this.active;
    }

    this.menuService.onMenuStateChange({ key: this.key });
  }

  get submenuAnimation() {
    const checkExpand = this.active ? 'expanded' : 'collapsed';
    return this.root ? 'expanded' : checkExpand;
  }

  @HostBinding('class.active-menuitem')
  get activeClass() {
    return this.active && !this.root;
  }
}
