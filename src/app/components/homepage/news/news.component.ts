import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { HomepageNews } from '@model/datatypes';
import { BackendService } from '@app/service';
import { MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Toast } from 'primeng/toast';
import { ButtonDirective } from 'primeng/button';
import { Ripple } from 'primeng/ripple';
import { TableModule } from 'primeng/table';
import { DatePipe } from '@angular/common';
import { EintragEditComponent } from '../eintrag-edit/eintrag-edit.component';

@Component({
  selector: 'app-homepage-news',
  templateUrl: './news.component.html',
  providers: [DialogService],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [Toast, ButtonDirective, Ripple, TableModule, DatePipe],
})
export class HomepageNewsComponent implements OnInit {
  private backendService = inject(BackendService);
  private messageService = inject(MessageService);
  private dialogService = inject(DialogService);

  readonly news = signal<HomepageNews[]>([]);
  readonly loading = signal(true);

  dialogRef?: DynamicDialogRef;

  ngOnInit(): void {
    this.backendService.getNewsData().subscribe({
      next: (result) => {
        this.news.set(result.data as HomepageNews[]);
        this.loading.set(false);
      },
    });
  }

  textPreview(item: HomepageNews): string {
    const stripped = item.text?.replace(/<[^>]+>/g, ' ').trim() ?? '';
    return stripped.length > 120 ? stripped.slice(0, 120) + '…' : stripped;
  }

  onAdd() {
    const neu = new HomepageNews();
    neu.datum = new Date().toISOString().substring(0, 10);
    this.openDialog(neu, 'Neue News erfassen', (saved) => {
      this.news.set([saved, ...this.news()]);
    });
  }

  onEdit(item: HomepageNews) {
    this.openDialog({ ...item }, 'News bearbeiten', (saved) => {
      this.news.set(this.news().map((n) => (n.id === saved.id ? saved : n)));
    });
  }

  private openDialog(eintrag: HomepageNews, header: string, apply: (saved: HomepageNews) => void) {
    this.dialogRef = this.dialogService.open(EintragEditComponent, {
      data: { eintrag, typ: 'news' },
      header,
      width: '70%',
      height: '80%',
      resizable: true,
      modal: true,
      maximizable: true,
      draggable: true,
    });
    this.dialogRef.onClose.subscribe((saved: HomepageNews | undefined) => {
      if (saved) {
        apply(saved);
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'News gespeichert',
        });
      }
    });
  }

  onDelete(item: HomepageNews) {
    this.backendService.delNewsData(item).subscribe({
      next: () => {
        this.news.set(this.news().filter((n) => n !== item));
      },
    });
  }
}
