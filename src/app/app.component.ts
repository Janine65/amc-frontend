import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { LoadingService } from '@app/service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RouterOutlet, ProgressSpinnerModule],
})
export class AppComponent implements OnInit {
  title = 'amc-frontend';

  private readonly loadingService = inject(LoadingService);
  readonly isLoading = this.loadingService.isLoading;

  constructor() {}

  ngOnInit(): void {}
}
