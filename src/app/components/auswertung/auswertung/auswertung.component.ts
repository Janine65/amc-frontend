import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { MeisterschaftAuswertung, ParamData } from '@model/datatypes';
import { BackendService } from '@app/service';
import { MessageService } from 'primeng/api';
import { Bind } from 'primeng/bind';
import { Select } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import type { ChartData, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-auswertung',
  templateUrl: './auswertung.component.html',
  styleUrls: ['./auswertung.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [Bind, Select, FormsModule, BaseChartDirective],
})
export class AuswertungComponent implements OnInit {
  private backendService = inject(BackendService);
  private messageService = inject(MessageService);

  readonly selJahre = signal<{ value: number; label: string }[]>([
    { value: 1, label: '1' },
    { value: 2, label: '2' },
    { value: 3, label: '3' },
  ]);
  readonly data = signal<ChartData<'bar'> | undefined>(undefined);
  readonly options = signal<ChartOptions<'bar'> | undefined>(undefined);

  selJahr = 2;
  jahr: number;
  private parameter: ParamData[] = [];
  private lstGraphData: MeisterschaftAuswertung[] = [];

  constructor() {
    const str = sessionStorage.getItem('parameter');
    this.parameter = str ? JSON.parse(str) : [];
    const paramJahr = this.parameter.find((param) => param.key === 'CLUBJAHR');
    this.jahr = Number(paramJahr?.value);
  }

  ngOnInit(): void {
    if (this.jahr) {
      this.selJahre.set([
        { value: this.jahr - 2, label: String(this.jahr - 2) },
        { value: this.jahr - 1, label: String(this.jahr - 1) },
        { value: this.jahr, label: String(this.jahr) },
      ]);
      this.selJahr = this.jahr;
    }

    this.updateGraph();
  }

  updateGraph() {
    this.backendService.getChartData(this.selJahr).subscribe({
      next: (list) => {
        this.lstGraphData = list.data as MeisterschaftAuswertung[];

        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--p-text-color');
        const textColorSecondary =
          documentStyle.getPropertyValue('--p-text-color');
        const surfaceBorder = documentStyle.getPropertyValue('--p-gray-300');

        const labels: Array<string>[] = [];
        const dataset1: number[] = [];
        const dataset2: number[] = [];

        this.lstGraphData.forEach((rec) => {
          const datum = new Date(rec.datum!);
          labels.push([rec.name!, datum.toLocaleDateString()]);
          dataset1.push(
            rec._count!.meisterschaft ? rec._count!.meisterschaft : 0,
          );
          dataset2.push(rec.gaeste ? rec.gaeste : 0);
        });

        const data = {
          labels: labels,
          datasets: [
            {
              label: 'Teilnehmer',
              backgroundColor: documentStyle.getPropertyValue('--p-blue-500'),
              borderColor: documentStyle.getPropertyValue('--p-blue-500'),
              data: dataset1,
            },
            {
              label: 'Gäste',
              backgroundColor: documentStyle.getPropertyValue('--p-pink-500'),
              borderColor: documentStyle.getPropertyValue('--p-pink-500'),
              data: dataset2,
            },
          ],
        };
        this.data.set(data);

        this.options.set({
          indexAxis: 'y',
          plugins: {
            legend: {
              position: 'top',
              labels: {
                color: textColor,
              },
            },
          },
          scales: {
            x: {
              stacked: true,
              position: 'bottom',
              ticks: {
                color: textColorSecondary,
                stepSize: 1,
                font: {
                  weight: 500,
                },
              },
              grid: {
                color: surfaceBorder,
              },
              border: {
                display: false,
              },
            },
            x2: {
              stacked: true,
              position: 'top',
              ticks: {
                color: textColorSecondary,
                stepSize: 1,
                font: {
                  weight: 500,
                },
              },
              grid: {
                color: surfaceBorder,
              },
              border: {
                display: false,
              },
              min: 0,
              max: data.datasets.reduce(
                (max, dataset) => Math.max(max, ...dataset.data),
                -Infinity,
              ),
            },
            y: {
              stacked: true,
              min: 0,
              ticks: {
                color: textColorSecondary,
                stepSize: 0,
                autoSkip: false,
              },
              grid: {
                color: surfaceBorder,
              },
              border: {
                display: false,
              },
            },
          },
        });
      },
    });
  }
}
