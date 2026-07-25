import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  NgForm,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { User } from '@app/models';
import { AccountService } from '@app/service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { Bind } from 'primeng/bind';
import { ScrollPanel } from 'primeng/scrollpanel';
import { CrInputPartial } from '../../shared/input-validation/input.partial';
import { InputDirective } from '../../shared/input-validation/input.directive';
import { InputText } from 'primeng/inputtext';
import { RadioButton } from 'primeng/radiobutton';
import { PasswordDirective } from 'primeng/password';
import { Toolbar } from 'primeng/toolbar';
import { Button } from 'primeng/button';
import { ConfirmDialog } from 'primeng/confirmdialog';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-add-edit',
  templateUrl: './add-edit.component.html',
  styleUrls: ['./add-edit.component.scss'],
  providers: [ConfirmationService],
  imports: [
    Bind,
    ScrollPanel,
    FormsModule,
    ReactiveFormsModule,
    CrInputPartial,
    InputDirective,
    InputText,
    RadioButton,
    PasswordDirective,
    Toolbar,
    Button,
    ConfirmDialog,
  ],
})
export class AddEditComponent implements OnInit {
  private accountService = inject(AccountService);
  ref = inject(DynamicDialogRef);
  config = inject(DynamicDialogConfig);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private fb = inject(FormBuilder);

  user!: User;
  withRole = false;
  wihtPwd = true;
  subs!: Subscription;
  fg: FormGroup;

  constructor() {
    const accountService = this.accountService;
    const config = this.config;

    if (config.data) {
      this.wihtPwd = config.data.withPwd;
      this.withRole = config.data.withRole;
      if (config.data.user) {
        this.user = config.data.user;
      } else {
        this.user = accountService.userValue;
      }
    } else {
      this.user = new User();
      this.user.role = 'user';
    }
  }

  ngOnInit() {
    this.fg = this.fb.group({
      name: [this.user.name],
      email: [this.user.email],
      passwordN: [''],
      passwordV: [''],
      role: [this.user.role],
    });
    return;
  }

  back() {
    if (this.fg.dirty) {
      this.confirmationService.confirm({
        message:
          'Du hast noch nicht-gespeicherte Veränderungen. Bist Du sicher, dass du diese verlieren willst?',
        accept: () => {
          this.ref.close();
        },
      });
    } else {
      this.ref.close();
    }
  }

  newPwd() {
    if (this.fg.dirty) {
      this.messageService.add({
        detail:
          'Du hast noch nicht-gespeicherte Veränderungen. Bitte diese zuerst speichern oder zurück und nochmals öffnen.',
        icon: 'pi pi-exclamation-triangle',
        closable: true,
        severity: 'error',
        sticky: true,
      });
      return;
    }

    this.confirmationService.confirm({
      message:
        'Für den User ' +
        this.user.name +
        ' wird ein neues Passwort gesetzt. Bist Du dir da sicher?',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.accountService
          .newPasswort(this.user.email || '')
          .subscribe({ next: () => this.ref.close() });
      },
    });
  }

  save() {
    if (this.fg.invalid) {
      this.messageService.add({
        detail:
          'Die Daten sind noch nicht korrekt und können nicht gespeichert werden',
        closable: true,
        severity: 'error',
        summary: 'User speichern',
      });
      return;
    }

    this.user.name = this.fg.value['name'];
    this.user.email = this.fg.value['email'];
    this.user.role = this.fg.value['role'];

    if (this.wihtPwd) {
      if (this.fg.value['passwordN'] !== this.fg.value['passwordV']) {
        this.messageService.add({
          detail: 'Die Passwörter sind nicht identisch',
          closable: true,
          severity: 'error',
          summary: 'User speichern',
        });
        return;
      }
      this.user.password = this.fg.value['passwordN'];
    }

    if (this.user.id == undefined || this.user.id < 0) {
      // neuer user
      this.accountService.register(this.user).subscribe({
        next: (newUser) => {
          this.ref.close(newUser.data as User);
        },
      });
    } else {
      this.accountService.update(this.user.id || -1, this.user).subscribe({
        next: () => {
          this.ref.close(this.user);
        },
      });
    }

    this.ref.close(this.user);
  }
}
