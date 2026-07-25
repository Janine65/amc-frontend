import {
  Component,
  DestroyRef,
  OnInit,
  inject,
  input,
  signal,
  ChangeDetectionStrategy
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, NavigationStart } from '@angular/router';

import { Alert, AlertType } from '@app/models';
import { AlertService } from '@app/service';
import { Bind } from 'primeng/bind';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [Bind, Button],
})
export class AlertComponent implements OnInit {
  private router = inject(Router);
  private alertService = inject(AlertService);
  private readonly destroyRef = inject(DestroyRef);

  readonly id = input('default-alert');
  readonly fade = input(true);

  readonly alerts = signal<Alert[]>([]);

  ngOnInit() {
    // subscribe to new alert notifications
    this.alertService
      .onAlert(this.id())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((alert) => {
        // clear alerts when an empty alert is received
        if (!alert.message) {
          // filter out alerts without 'keepAfterRouteChange' flag
          this.alerts.set(this.alerts().filter((x) => x.keepAfterRouteChange));

          // remove 'keepAfterRouteChange' flag on the rest
          this.alerts.set(this.alerts().filter((x) => !x.keepAfterRouteChange));
          return;
        }

        // add alert to array
        this.alerts.set([...this.alerts(), alert]);

        // auto close alert if required
        if (alert.autoClose) {
          setTimeout(() => this.removeAlert(alert), 3000);
        }
      });

    // clear alerts on location change
    this.router.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        if (event instanceof NavigationStart) {
          this.alertService.clear(this.id());
        }
      });
  }

  removeAlert(alert: Alert) {
    // check if already removed to prevent error on auto close
    if (!this.alerts().includes(alert)) return;

    if (this.fade()) {
      // fade out alert
      alert.fade = true;

      // remove alert after faded out
      setTimeout(() => {
        this.alerts.set(this.alerts().filter((x) => x !== alert));
      }, 250);
    } else {
      // remove alert
      this.alerts.set(this.alerts().filter((x) => x !== alert));
    }
  }

  cssButtonClass(alert: Alert) {
    if (!alert) return '';

    const classes = ['p-button-rounded', 'p-button-text'];

    const alertTypeClass = {
      [AlertType.Success]: 'p-button--success',
      [AlertType.Error]: 'p-button-danger',
      [AlertType.Info]: 'p-button-info',
      [AlertType.Warning]: 'p-button-warning',
    };

    classes.push(alertTypeClass[alert.type]);

    if (alert.fade) {
      classes.push('fade');
    }

    return classes.join(' ');
  }

  cssClass(alert: Alert) {
    if (!alert) return '';

    const classes = ['alert', 'alert-dismissable', 'mt-6', 'container'];

    const alertTypeClass = {
      [AlertType.Success]: 'alert alert-success',
      [AlertType.Error]: 'alert alert-danger',
      [AlertType.Info]: 'alert alert-info',
      [AlertType.Warning]: 'alert alert-warning',
    };

    classes.push(alertTypeClass[alert.type]);

    if (alert.fade) {
      classes.push('fade');
    }

    return classes.join(' ');
  }
}
