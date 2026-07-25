import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { BackendService } from '@app/service';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { Bind } from 'primeng/bind';
import { FileUpload } from 'primeng/fileupload';
import { Toolbar } from 'primeng/toolbar';
import { ButtonDirective } from 'primeng/button';

@Component({
  selector: 'app-attachment-add',
  templateUrl: './attachment-add.component.html',
  styleUrls: ['./attachment-add.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [Bind, FileUpload, Toolbar, ButtonDirective],
})
export class AttachmentAddComponent {
  private backendService = inject(BackendService);
  ref = inject(DynamicDialogRef);
  config = inject(DynamicDialogConfig);
  private messageService = inject(MessageService);

  journalid = 0;
  jahr: string = '';
  uploadFiles: File[] = [];
  uploadProgress: number | null = null;
  uploadSub?: Subscription;

  constructor() {
    const config = this.config;

    this.journalid = config.data.journalid;
    this.jahr = config.data.jahr;
  }

  prepareFiles(files: File[]) {
    this.uploadProgress = 0;
    for (const f of files) {
      this.backendService.uploadFiles(f).subscribe({
        next: (response) => {
          if (response.type == 'info') {
            this.uploadFiles.push(f);
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

  reset() {
    this.uploadProgress = null;
    this.uploadSub = undefined;
  }

  back() {
    this.ref.close();
  }

  save() {
    const files = this.uploadFiles.map((value: File) => value.name).join(',');
    if (files.length > 0)
      this.backendService
        .bulkAddReceipt(this.jahr, this.journalid, files)
        .subscribe({
          next: (resp) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Erfolg',
              detail: resp.message,
            });
            this.ref.close();
          },
        });
    this.ref.close();
  }
}
