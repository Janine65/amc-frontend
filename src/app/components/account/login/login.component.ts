import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  NgForm,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { last } from 'rxjs/operators';
import { AccountService, AlertService } from '@app/service';
import { AlertType } from '@app/models';
import { MessageService } from 'primeng/api';
import { CrInputPartial } from '../../shared/input-validation/input.partial';
import { InputDirective } from '../../shared/input-validation/input.directive';
import { Bind } from 'primeng/bind';
import { InputText } from 'primeng/inputtext';
import { PasswordDirective } from 'primeng/password';
import { ButtonDirective } from 'primeng/button';
import { Ripple } from 'primeng/ripple';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [MessageService],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CrInputPartial,
    InputDirective,
    Bind,
    InputText,
    PasswordDirective,
    ButtonDirective,
    Ripple,
  ],
})
export class LoginComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private accountService = inject(AccountService);
  private alertService = inject(AlertService);
  private fb = inject(FormBuilder);

  readonly loading = signal(false);
  readonly submitted = signal(false);
  fg: FormGroup;

  ngOnInit() {
    this.fg = this.fb.group({
      email: [''],
      password: [''],
    });
    return;
  }

  async onReset() {
    // reset alerts on submit
    this.alertService.clear();
    if (this.fg.get('email').value == '') {
      this.alertService.alert({
        autoClose: false,
        fade: false,
        type: AlertType.Error,
        message: 'Email nicht ausgefüllt',
        keepAfterRouteChange: false,
      });
      return;
    }

    this.submitted.set(true);
    this.loading.set(true);
    this.accountService
      .newPasswort(this.fg.get('email').value)
      .pipe(last())
      .subscribe({
        next: async () => {
          // get return url from query parameters or default to home page
          this.alertService.alert({
            autoClose: false,
            fade: false,
            type: AlertType.Success,
            message: 'Mail gesendet mit neuem Passwort',
            keepAfterRouteChange: false,
          });
          await this.router.navigateByUrl('/');
        },
      });
  }

  onSubmit() {
    // reset alerts on submit
    this.alertService.clear();

    // stop here if form is invalid
    if (this.fg.invalid) {
      return;
    }

    this.submitted.set(true);

    this.loading.set(true);

    this.accountService
      .login(this.fg.get('email').value, this.fg.get('password').value)
      .pipe(last())
      .subscribe({
        next: async () => {
          // get return url from query parameters or default to home page
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
          await this.router.navigateByUrl(returnUrl);
        },
        error: (error) => {
          this.alertService.error(error);
          this.loading.set(false);
        },
      });
  }
}
