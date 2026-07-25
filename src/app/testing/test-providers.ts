import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';

export const commonTestProviders = [
  provideRouter([]),
  provideHttpClient(withXhr()),
  provideHttpClientTesting(),
  provideNoopAnimations(),
  MessageService,
  ConfirmationService,
  DialogService,
  { provide: DynamicDialogRef, useValue: { close: () => undefined } },
  { provide: DynamicDialogConfig, useValue: { data: {} } },
];
