import {
  AfterViewInit,
  Component,
  OnDestroy,
  inject,
  signal,
  ChangeDetectionStrategy
} from '@angular/core';
import { BackendService } from '@app/service';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-attachement-show',
  templateUrl: './attachement-show.component.html',
  styleUrls: ['./attachement-show.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [ButtonModule],
})
export class AttachementShowComponent implements AfterViewInit, OnDestroy {
  private backendService = inject(BackendService);
  config = inject(DynamicDialogConfig);
  ref = inject(DynamicDialogRef);
  private sanitizer = inject(DomSanitizer);

  receipt = '';
  year = '';
  readonly pdfFile = signal<SafeResourceUrl>('');
  private documentBlobObjectUrl = '';

  constructor() {
    const config = this.config;

    this.receipt = config.data.receipt;
    this.year = config.data.year;
  }

  ngOnDestroy(): void {
    URL.revokeObjectURL(this.documentBlobObjectUrl);
  }

  ngAfterViewInit(): void {
    this.backendService.uploadAtt(this.receipt, this.year).subscribe({
      next: (file) => {
        this.documentBlobObjectUrl = URL.createObjectURL(file);
        this.pdfFile.set(
          this.sanitizer.bypassSecurityTrustResourceUrl(
            this.documentBlobObjectUrl,
          ),
        );
      },
    });
  }
}
