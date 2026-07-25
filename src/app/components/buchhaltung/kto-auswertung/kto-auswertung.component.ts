import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { AccountAuswertung, ParamData } from '@model/datatypes';
import { BackendService } from '@app/service';
import { MessageService } from 'primeng/api';
import { Bind } from 'primeng/bind';
import { Toolbar } from 'primeng/toolbar';
import { Select } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { ButtonDirective } from 'primeng/button';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primeng/tabs';
import { Ripple } from 'primeng/ripple';
import { DataView } from 'primeng/dataview';
import { NgClass, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-kto-auswertung',
  templateUrl: './kto-auswertung.component.html',
  styleUrls: ['./kto-auswertung.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    Bind,
    Toolbar,
    Select,
    FormsModule,
    ButtonDirective,
    Tabs,
    TabList,
    Ripple,
    Tab,
    TabPanels,
    TabPanel,
    DataView,
    NgClass,
    DecimalPipe,
  ],
})
export class KtoAuswertungComponent {
  private backendService = inject(BackendService);
  private messageService = inject(MessageService);

  readonly selJahre = signal<{ label?: string; value?: number }[]>([]);
  selJahr = 0;
  readonly jahr = signal(0);
  readonly lstAktivNodes = signal<AccountAuswertung[]>([]);
  readonly lstPassivNodes = signal<AccountAuswertung[]>([]);
  readonly lstAufwandNodes = signal<AccountAuswertung[]>([]);
  readonly lstErfolgNodes = signal<AccountAuswertung[]>([]);

  constructor() {
    const str = sessionStorage.getItem('parameter');
    const parameter: ParamData[] = str ? JSON.parse(str) : [];
    const paramJahr = parameter.find((param) => param.key === 'CLUBJAHR');
    const jahr = Number(paramJahr?.value);
    this.jahr.set(jahr);
    this.selJahr = jahr;
    this.selJahre.set([
      { label: (jahr - 4).toString(), value: jahr - 4 },
      { label: (jahr - 3).toString(), value: jahr - 3 },
      { label: (jahr - 2).toString(), value: jahr - 2 },
      { label: (jahr - 1).toString(), value: jahr - 1 },
      { label: jahr.toString(), value: jahr },
      { label: (jahr + 1).toString(), value: jahr + 1 },
    ]);
    this.readBericht();
  }

  chgJahr() {
    this.readBericht();
  }

  readBericht() {
    this.backendService.showAccData(this.selJahr).subscribe({
      next: (result) => {
        const data = result.data as AccountAuswertung[];
        if (!data || data.length === 0) {
          return;
        }

        const aktiv: AccountAuswertung[] = [];
        const passiv: AccountAuswertung[] = [];
        const aufwand: AccountAuswertung[] = [];
        const erfolg: AccountAuswertung[] = [];

        let iTotalAktiv = 0,
          iTotalPassiv = 0,
          iTotalAufwand = 0,
          iTotalErfolg = 0;
        let iBudgetAufwand = 0,
          iBudgetErfolg = 0;

        data.forEach((rec) => {
          switch (rec.level) {
            case 1:
              aktiv.push(rec);
              iTotalAktiv += rec.amount;
              break;
            case 2:
              passiv.push(rec);
              iTotalPassiv += rec.amount;
              break;
            case 4:
              aufwand.push(rec);
              iTotalAufwand += rec.amount;
              iBudgetAufwand += rec.budget;
              break;
            case 6:
              erfolg.push(rec);
              iTotalErfolg += rec.amount;
              iBudgetErfolg += rec.budget;
              break;
            default:
              break;
          }
        });

        let iDiffTotal = iTotalAktiv - iTotalPassiv;
        let totalRec = new AccountAuswertung();
        totalRec.amount = iDiffTotal;
        totalRec.name = iDiffTotal < 0 ? 'Verlust' : 'Gewinn';
        totalRec.$css = iDiffTotal < 0 ? 'alert-minus' : 'alert-plus';
        if (iDiffTotal < 0) {
          aktiv.push(totalRec);
        } else {
          passiv.push(totalRec);
        }
        totalRec = new AccountAuswertung();
        totalRec.amount = Math.max(iTotalAktiv, iTotalPassiv);
        totalRec.name = 'Aktiv';
        totalRec.$css = 'alert-total';
        aktiv.push(totalRec);
        totalRec = new AccountAuswertung();
        totalRec.amount = Math.max(iTotalAktiv, iTotalPassiv);
        totalRec.name = 'Passiv';
        totalRec.$css = 'alert-total';
        passiv.push(totalRec);

        totalRec = new AccountAuswertung();
        totalRec.amount = iTotalErfolg;
        totalRec.budget = iBudgetErfolg;
        totalRec.diff = totalRec.amount - totalRec.budget;
        totalRec.name = 'Ertrag';
        totalRec.$css = 'alert-total';
        erfolg.push(totalRec);
        totalRec = new AccountAuswertung();
        totalRec.amount = iTotalAufwand;
        totalRec.budget = iBudgetAufwand;
        totalRec.diff = totalRec.amount - totalRec.budget;
        totalRec.name = 'Aufwand';
        totalRec.$css = 'alert-total';
        aufwand.push(totalRec);

        iDiffTotal = iTotalErfolg - iTotalAufwand;
        totalRec = new AccountAuswertung();
        totalRec.amount = iDiffTotal;
        totalRec.budget = iBudgetErfolg - iBudgetAufwand;
        totalRec.diff = totalRec.budget - totalRec.amount;
        totalRec.name = iDiffTotal < 0 ? 'Verlust' : 'Gewinn';
        totalRec.$css = iDiffTotal < 0 ? 'alert-minus' : 'alert-plus';
        if (iDiffTotal < 0) {
          erfolg.push(totalRec);
        } else {
          aufwand.push(totalRec);
        }

        this.lstAktivNodes.set(aktiv);
        this.lstPassivNodes.set(passiv);
        this.lstAufwandNodes.set(aufwand);
        this.lstErfolgNodes.set(erfolg);
      },
    });
  }

  export() {
    this.backendService.exportAccData(this.selJahr).subscribe({
      next: (result) => {
        if (result.type == 'info') {
          const filename = result.data.filename;
          this.backendService.downloadFile(filename).subscribe({
            next(data) {
              if (data.body) {
                const blob = new Blob([data.body]);
                const downloadURL = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = downloadURL;
                link.download = filename;
                link.click();
              }
            },
          });
        }
      },
    });
  }
}
