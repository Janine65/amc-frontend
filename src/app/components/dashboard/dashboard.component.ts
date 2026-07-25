/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Component, OnDestroy, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { Subscription, from, map, zip } from 'rxjs';
import { BackendService } from '@app/service';
import { Fiscalyear, OverviewData, ParamData } from '@model/datatypes';
import { Bind } from 'primeng/bind';
import { Fieldset } from 'primeng/fieldset';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [Bind, Fieldset],
})
export class DashboardComponent implements OnInit, OnDestroy {
  private backendService = inject(BackendService);

  readonly dashboarData = signal<OverviewData[]>([]);
  readonly fiscalyear = signal<Fiscalyear | undefined>(undefined);
  readonly jahr = signal('');
  readonly loading = signal(true);
  private parameter: ParamData[] = [];
  private subs!: Subscription;

  ngOnDestroy(): void {
    if (this.subs) this.subs.unsubscribe();
  }

  ngOnInit() {
    this.subs = from(this.backendService.getParameterData()).subscribe(
      async (list) => {
        this.parameter = list.data as ParamData[];
        sessionStorage.setItem('parameter', JSON.stringify(this.parameter));
        const element = this.parameter.find(
          (element) => element.key === 'CLUBJAHR',
        );
        if (element) {
          this.jahr.set(element.value);
          const header = document.getElementById('header');
          header!.innerText =
            'Auto-Moto-Club Swissair - Clubjahr ' + this.jahr();
          this.subs.unsubscribe();
          this.subs = zip(
            this.backendService.getDashboardAdressData(),
            this.backendService.getDashboardAnlaesseData(),
            this.backendService.getDashboardClubmeisterData(),
            this.backendService.getDashboardKegelmeisterData(),
            this.backendService.getDashboarJournalData(this.jahr()),
          )
            .pipe(
              map(([list1, list2, list3, list4, retdata]) => {
                const data: OverviewData[] = [];
                data.push(...(list1.data as OverviewData[]));
                data.push(...(list2.data as OverviewData[]));
                data.push(...(list3.data as OverviewData[]));
                data.push(...(list4.data as OverviewData[]));
                const fy = retdata.data as Fiscalyear;
                this.fiscalyear.set(fy);
                if (fy) {
                  let value = '';
                  switch (fy.state) {
                    case 1:
                      value = fy.name + ' - offen';
                      break;
                    case 2:
                      value = fy.name + ' - prov. abgeschlossen';
                      break;
                    default:
                      value = fy.name + ' - abgeschlossen';
                      break;
                  }
                  data.push({ label: 'Buchhaltung', value });
                }
                this.dashboarData.set(data);
                this.loading.set(false);
              }),
            )
            .subscribe();
        }
      },
    );
  }

  public getJahr(): string {
    if (!this.loading()) return this.jahr();
    return '';
  }
  getAnzahlForKey(key: string): string {
    const element = this.dashboarData().find((rec) => rec.label === key);
    if (element) return element.value;

    return 'not found';
  }
}
