import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { HomepageBericht } from '@model/datatypes';
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
  selector: 'app-homepage-berichte',
  templateUrl: './berichte.component.html',
  providers: [DialogService],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [Toast, ButtonDirective, Ripple, TableModule, DatePipe],
})
export class HomepageBerichteComponent implements OnInit {
  private backendService = inject(BackendService);
  private messageService = inject(MessageService);
  private dialogService = inject(DialogService);

  readonly berichte = signal<HomepageBericht[]>([]);
  readonly loading = signal(true);

  dialogRef?: DynamicDialogRef;

  ngOnInit(): void {
    this.backendService.getBerichteData().subscribe({
      next: (result) => {
        this.berichte.set(result.data as HomepageBericht[]);
        this.loading.set(false);
      },
    });
  }

  textPreview(item: HomepageBericht): string {
    const stripped = item.text?.replace(/<[^>]+>/g, ' ').trim() ?? '';
    return stripped.length > 120 ? stripped.slice(0, 120) + '…' : stripped;
  }

  onAdd() {
    const neu = new HomepageBericht();
    neu.datum = new Date().toISOString().substring(0, 10);
    this.openDialog(neu, 'Neuen Bericht erfassen', (saved) => {
      this.berichte.set([saved, ...this.berichte()]);
    });
  }

  onEdit(item: HomepageBericht) {
    this.openDialog({ ...item }, 'Bericht bearbeiten', (saved) => {
      this.berichte.set(this.berichte().map((b) => (b.id === saved.id ? saved : b)));
    });
  }

  private openDialog(eintrag: HomepageBericht, header: string, apply: (saved: HomepageBericht) => void) {
    this.dialogRef = this.dialogService.open(EintragEditComponent, {
      data: { eintrag, typ: 'bericht' },
      header,
      width: '70%',
      height: '80%',
      resizable: true,
      modal: true,
      maximizable: true,
      draggable: true,
    });
    this.dialogRef.onClose.subscribe((saved: HomepageBericht | undefined) => {
      if (saved) {
        apply(saved);
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Bericht gespeichert',
        });
      }
    });
  }

  onDelete(item: HomepageBericht) {
    this.backendService.delBerichtData(item).subscribe({
      next: () => {
        this.berichte.set(this.berichte().filter((b) => b !== item));
      },
    });
  }
}
