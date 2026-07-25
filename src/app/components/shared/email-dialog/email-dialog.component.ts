import { Component, OnDestroy, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { AccountService, BackendService } from '@app/service';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { EmailBody, EmailSignature } from './email-dialog.types';
import { MessageService } from 'primeng/api';
import { environment } from '@environments/environment';
import { Subscription } from 'rxjs';
import { Bind } from 'primeng/bind';
import { Toolbar } from 'primeng/toolbar';
import { ButtonDirective } from 'primeng/button';
import { ProgressSpinner } from 'primeng/progressspinner';
import { FormsModule } from '@angular/forms';
import { Textarea } from 'primeng/textarea';
import { Select } from 'primeng/select';
import { Editor } from 'primeng/editor';
import { FileUpload } from 'primeng/fileupload';

@Component({
  selector: 'app-email-dialog',
  templateUrl: './email-dialog.component.html',
  styleUrls: ['./email-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    Bind,
    Toolbar,
    ButtonDirective,
    ProgressSpinner,
    FormsModule,
    Textarea,
    Select,
    Editor,
    FileUpload,
  ],
})
export class EmailDialogComponent {
  private backendService = inject(BackendService);
  ref = inject(DynamicDialogRef);
  config = inject(DynamicDialogConfig);
  private messageService = inject(MessageService);
  private accountService = inject(AccountService);

  emailBody: EmailBody;
  readonly uploadFiles = signal<File[]>([]);
  uploadProgress: number | null = null;
  uploadSub?: Subscription;
  readonly loading = signal(false);

  readonly lstSignature = signal([
    {
      label: 'Hansjörg Dutler',
      value: EmailSignature.HansjoergDutler,
    },
    { label: 'Janine Franken', value: EmailSignature.JanineFranken },
  ]);

  quillFormats = [
    ['bold', 'italic', 'underline', 'strike'], // toggled buttons
    ['blockquote', 'code-block'],
    ['link', 'image'],

    [{ header: 1 }, { header: 2 }], // custom button values
    [{ list: 'ordered' }, { list: 'bullet' }, { list: 'check' }],
    [{ script: 'sub' }, { script: 'super' }], // superscript/subscript
    [{ indent: '-1' }, { indent: '+1' }], // outdent/indent

    [{ size: ['small', false, 'large', 'huge'] }], // custom dropdown

    [{ color: [] }, { background: [] }], // dropdown with defaults from theme
    [{ font: [] }],
    [{ align: [] }],

    ['clean'], // remove formatting button
  ];

  modules = {
    toolbar: this.quillFormats,
    history: {
      delay: 2000,
      maxStack: 500,
      userOnly: true,
    },
  };

  constructor() {
    const config = this.config;

    this.emailBody = config.data.emailBody;
  }

  prepareFiles(files: File[]) {
    this.uploadProgress = 0;
    for (const f of files) {
      this.backendService.uploadFiles(f).subscribe({
        next: (response) => {
          if (response.type == 'info') {
            this.uploadFiles.set([...this.uploadFiles(), f]);
          }
        },
        complete: () => {
          this.uploadProgress = 100;
        },
      });
    }
  }

  cancelUpload() {
    if (this.uploadSub) this.uploadSub.unsubscribe();
    this.reset();
  }

  removeUploadFile(index: number) {
    this.uploadFiles.set(this.uploadFiles().filter((_, i) => i !== index));
  }

  reset() {
    this.uploadProgress = null;
    this.uploadSub = undefined;
  }

  back() {
    this.ref.close();
  }
  submit() {
    // send mail
    if (
      (this.emailBody.email_an == undefined || this.emailBody.email_an == '') &&
      (this.emailBody.email_cc == undefined || this.emailBody.email_cc == '') &&
      (this.emailBody.email_bcc == undefined || this.emailBody.email_bcc == '')
    ) {
      this.messageService.add({
        summary:
          'Fehler: Email senden: An wen willst Du diese Email senden? Keinen Absender angegeben.',
        severity: 'error',
        closable: true,
      });
      return;
    }

    if (
      this.emailBody.email_subject == undefined ||
      this.emailBody.email_subject == ''
    ) {
      this.messageService.add({
        summary: 'Fehler: Email senden: Kein Betreff angegeben.',
        severity: 'error',
        closable: true,
      });
      return;
    }

    if (
      this.emailBody.email_body == undefined ||
      this.emailBody.email_body == ''
    ) {
      this.messageService.add({
        summary: 'Fehler: Email senden: Keinen Text angegeben.',
        severity: 'error',
        closable: true,
      });
      return;
    }

    this.loading.set(true);

    if (this.uploadFiles().length > 0) {
      this.emailBody.email_uploadfiles = this.uploadFiles()
        .map((file) => file.name)
        .join(',');
    }

    if (this.emailBody.email_signature == undefined) {
      this.emailBody.email_signature = Object.keys(EmailSignature)[
        Object.values(EmailSignature).indexOf(
          environment.defaultSignature as unknown as EmailSignature,
        )
      ] as unknown as EmailSignature;
    }
    let textStrap = this.emailBody.email_body.replace('<p>', '');
    textStrap = textStrap.replace('</p>', '</br>');
    this.emailBody.email_body = textStrap;

    // alles bereit zum Senden der Email
    this.backendService.sendEmail(this.emailBody).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.type == '250 Message received')
          this.messageService.add({
            summary: 'OK: Email senden: Email wurde versandt.',
            severity: 'info',
            sticky: false,
            closable: false,
            life: 2000,
          });
        this.ref.close(res);
      },
      error: (res) => {
        this.loading.set(false);
        this.messageService.add({
          summary: 'Fehler: Email senden: ' + res.message,
          severity: 'error',
          sticky: true,
          closable: true,
        });
      },
    });
  }
}
