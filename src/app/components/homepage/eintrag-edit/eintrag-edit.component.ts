import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HomepageBericht, HomepageNews } from '@model/datatypes';
import { BackendService, RetData } from '@app/service';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Observable } from 'rxjs';
import { Toolbar } from 'primeng/toolbar';
import { ButtonDirective } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { DatePicker } from 'primeng/datepicker';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { QuillEditorComponent } from 'ngx-quill';

@Component({
  selector: 'app-eintrag-edit',
  templateUrl: './eintrag-edit.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    FormsModule,
    Toolbar,
    ButtonDirective,
    InputText,
    DatePicker,
    ToggleSwitch,
    QuillEditorComponent,
  ],
})
export class EintragEditComponent {
  private backendService = inject(BackendService);
  ref = inject(DynamicDialogRef);
  config = inject(DynamicDialogConfig);
  private messageService = inject(MessageService);

  eintrag: HomepageNews | HomepageBericht;
  typ: 'news' | 'bericht';
  datumDate: Date;

  quillModules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote'],
      ['link', 'image'],
      [{ header: 1 }, { header: 2 }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ size: ['small', false, 'large', 'huge'] }],
      [{ color: [] }, { background: [] }],
      [{ align: [] }],
      ['clean'],
    ],
    history: {
      delay: 2000,
      maxStack: 500,
      userOnly: true,
    },
  };

  constructor() {
    this.eintrag = this.config.data.eintrag;
    this.typ = this.config.data.typ;
    this.datumDate = this.eintrag.datum ? new Date(this.eintrag.datum) : new Date();
  }

  get istBericht(): boolean {
    return this.typ === 'bericht';
  }

  get bericht(): HomepageBericht {
    return this.eintrag as HomepageBericht;
  }

  back() {
    this.ref.close();
  }

  save() {
    if (!this.eintrag.titel?.trim() || !this.eintrag.text?.trim()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Speichern',
        detail: 'Titel und Text müssen ausgefüllt sein',
        closable: true,
      });
      return;
    }
    // Quill 2 (getSemanticHTML) ersetzt Leerzeichen durch &nbsp; – verhindert Zeilenumbruch auf der Homepage
    this.eintrag.text = this.eintrag.text.replace(/&nbsp;|\u00a0/g, ' ');
    this.eintrag.datum = this.datumDate.toLocaleDateString('fr-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

    let sub: Observable<RetData>;
    if (this.typ === 'news') {
      const news = this.eintrag as HomepageNews;
      sub = news.id == 0 ? this.backendService.addNewsData(news) : this.backendService.updNewsData(news);
    } else {
      const bericht = this.eintrag as HomepageBericht;
      sub =
        bericht.id == 0
          ? this.backendService.addBerichtData(bericht)
          : this.backendService.updBerichtData(bericht);
    }
    sub.subscribe({
      next: (ret) => {
        this.ref.close(ret.data);
      },
    });
  }
}
