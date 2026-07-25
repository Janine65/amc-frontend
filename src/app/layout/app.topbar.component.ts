import {
  Component,
  ElementRef,
  inject,
  signal,
  viewChild,
  ChangeDetectionStrategy
} from '@angular/core';
import { LayoutService } from '../service/app.layout.service';
import { Bind } from 'primeng/bind';
import { Toast } from 'primeng/toast';
import { RouterLink } from '@angular/router';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-topbar',
  templateUrl: './app.topbar.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [Bind, Toast, RouterLink, Button],
})
export class AppTopBarComponent {
  layoutService = inject(LayoutService);

  readonly menuButton = viewChild.required<ElementRef>('menubutton');
  readonly menu = viewChild.required<ElementRef>('topbarmenu');

  iconDarkmode = 'pi pi-moon';
  iconLightmode = 'pi pi-sun';
  readonly iconMode = signal(this.iconLightmode);

  toggleDarkMode() {
    const element = document.querySelector('html');
    element.classList.toggle('my-app-dark');
    this.iconMode.set(
      element.classList.contains('my-app-dark')
        ? this.iconDarkmode
        : this.iconLightmode,
    );
  }
}
