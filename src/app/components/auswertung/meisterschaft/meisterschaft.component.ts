import { Component, HostListener, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { Clubmeister, Kegelmeister, ParamData } from '@model/datatypes';
import { BackendService } from '@app/service';
import { MessageService } from 'primeng/api';
import { map, zip } from 'rxjs';
import { Bind } from 'primeng/bind';
import { Toast } from 'primeng/toast';
import { Select } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { Splitter } from 'primeng/splitter';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-meisterschaft',
  templateUrl: './meisterschaft.component.html',
  styleUrls: ['./meisterschaft.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    Bind,
    Toast,
    Select,
    FormsModule,
    Button,
    Splitter,
    TableModule,
  ],
})
export class MeisterschaftComponent implements OnInit {
  private backendService = inject(BackendService);
  private messageService = inject(MessageService);

  readonly selJahre = signal<{ value: number; label: string }[]>([
    { value: 1, label: '1' },
    { value: 2, label: '2' },
    { value: 3, label: '3' },
  ]);
  readonly lstClubmeister = signal<Clubmeister[]>([]);
  readonly lstKegelmeister = signal<Kegelmeister[]>([]);
  readonly loading = signal(true);
  readonly objHeightc$ = signal('400px');
  readonly objHeightk$ = signal('400px');

  selJahr = 2;
  jahr: number | null = null;
  private parameter: ParamData[] = [];
  private getScreenWidth = 0;
  private getScreenHeight = 0;

  constructor() {
    const str = sessionStorage.getItem('parameter');
    this.parameter = str ? JSON.parse(str) : [];
    const paramJahr = this.parameter.find((param) => param.key === 'CLUBJAHR');
    this.jahr = Number(paramJahr?.value);
  }

  @HostListener('window:resize')
  onWindowResize() {
    this.getScreenWidth = window.innerWidth;
    this.getScreenHeight = window.innerHeight;
    this.getHeight();
  }

  ngOnInit(): void {
    this.getScreenWidth = window.innerWidth;
    this.getScreenHeight = window.innerHeight;

    this.getHeight();

    if (this.jahr) {
      this.selJahre.set([
        { value: this.jahr - 1, label: String(this.jahr - 1) },
        { value: this.jahr, label: String(this.jahr) },
        { value: this.jahr + 1, label: String(this.jahr + 1) },
      ]);
      this.selJahr = this.jahr;

      this.readMeisterschaft();
    }
  }

  private getHeight() {
    const h = (this.getScreenHeight - 400).toFixed(0) + 'px';
    this.objHeightc$.set(h);
    this.objHeightk$.set(h);
  }

  public refresh() {
    this.loading.set(true);

    zip(
      this.backendService.refreshClubmeister(this.selJahr),
      this.backendService.refreshKegelmeister(this.selJahr),
    ).subscribe({
      complete: () => {
        this.readMeisterschaft();
        this.messageService.add({
          detail: 'Die Daten wurden aktualisiert',
          closable: true,
          severity: 'info',
          summary: 'Meisterschaft aktualisieren',
          sticky: false,
        });
      },
    });
  }

  public readMeisterschaft() {
    this.loading.set(true);

    zip(
      this.backendService.getClubmeister(this.selJahr),
      this.backendService.getKegelmeister(this.selJahr),
    )
      .pipe(
        map(([list1, list2]) => {
          this.lstClubmeister.set(list1.data as Clubmeister[]);
          this.lstKegelmeister.set(list2.data as Kegelmeister[]);
          this.loading.set(false);
          this.getHeight();
        }),
      )
      .subscribe();
  }
}
