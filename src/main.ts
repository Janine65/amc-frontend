import {
  ApplicationRef,
  ErrorHandler,
  forwardRef,
  importProvidersFrom,
} from '@angular/core';
import {
  enableDebugTools,
  BrowserModule,
  bootstrapApplication,
} from '@angular/platform-browser';
import {
  LocationStrategy,
  HashLocationStrategy,
  CommonModule,
  DecimalPipe,
  DatePipe,
  PercentPipe,
} from '@angular/common';
import { GlobalErrorHandler } from './app/service/global-error-handler';
import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withInterceptorsFromDi,
  withXhr
} from '@angular/common/http';
import { JwtInterceptor, ErrorInterceptor } from './app/service';
import { MessageService } from 'primeng/api';
import {
  NG_VALUE_ACCESSOR,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { CrInputPartial } from './app/components/shared/input-validation/input.partial';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import { MyTheme2 } from './app/mytheme-2';
import { AppRoutingModule } from './app/app-routing.module';
import { DrawerModule } from 'primeng/drawer';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ButtonModule } from 'primeng/button';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { InputTextModule } from 'primeng/inputtext';
import { BadgeModule } from 'primeng/badge';
import { RippleModule } from 'primeng/ripple';
import { PanelModule } from 'primeng/panel';
import { FieldsetModule } from 'primeng/fieldset';
import { DataViewModule } from 'primeng/dataview';
import { TableModule } from 'primeng/table';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToolbarModule } from 'primeng/toolbar';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { MessageModule } from 'primeng/message';
import { SelectButtonModule } from 'primeng/selectbutton';
import { PasswordModule } from 'primeng/password';
import { ContextMenuModule } from 'primeng/contextmenu';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { EditorModule } from 'primeng/editor';
import { FileUploadModule } from 'primeng/fileupload';
import { SplitterModule } from 'primeng/splitter';
import { TextareaModule } from 'primeng/textarea';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { TabsModule } from 'primeng/tabs';
import { StyleClassModule } from 'primeng/styleclass';
import { AutoFocusModule } from 'primeng/autofocus';
import { ProgressBarModule } from 'primeng/progressbar';
import { TagModule } from 'primeng/tag';
import { MatIconModule } from '@angular/material/icon';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { IconFieldModule } from 'primeng/iconfield';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(
      BrowserModule,
      AppRoutingModule,
      CommonModule,
      FormsModule,
      DrawerModule,
      RadioButtonModule,
      ButtonModule,
      ToggleSwitchModule,
      InputTextModule,
      BadgeModule,
      RippleModule,
      PanelModule,
      FieldsetModule,
      DataViewModule,
      TableModule,
      DynamicDialogModule,
      ScrollPanelModule,
      DatePickerModule,
      InputNumberModule,
      ToolbarModule,
      SelectModule,
      ToastModule,
      MessageModule,
      SelectButtonModule,
      PasswordModule,
      ContextMenuModule,
      ConfirmDialogModule,
      DialogModule,
      EditorModule,
      FileUploadModule,
      SplitterModule,
      ReactiveFormsModule,
      TextareaModule,
      AutoCompleteModule,
      TabsModule,
      StyleClassModule,
      AutoFocusModule,
      ProgressBarModule,
      TagModule,
      DecimalPipe,
      DatePipe,
      PercentPipe,
      MatIconModule,
      ProgressSpinnerModule,
      IconFieldModule,
    ),
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    { provide: MessageService, useClass: MessageService },
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CrInputPartial),
      multi: true,
    },
    provideHttpClient(withXhr(), withInterceptorsFromDi()),
    provideAnimationsAsync(),
    provideCharts(withDefaultRegisterables()),
    providePrimeNG({
      ripple: true,
      license: 'eyJpZCI6IjkyYzFjYTlmLWY0NDQtNDA1Yy1iZThjLTliYWViZTM2MDJhNiIsInByb2R1Y3QiOiJwcmltZXVpIiwidGllciI6ImNvbW11bml0eSIsInR5cGUiOiJkZXYiLCJpYXQiOjE3ODQ5NzkyODksImV4cCI6MTgxNjUxNTI4OX0.hZ_pHnFRtNmqGT9u2C-335MBsqeLIiiO0MsDJAQCAqPwklSQY44M8_UHHJ-pzsis3NKdsNyxDyPOSCNwmNnDBw',
      theme: {
        preset: MyTheme2,
        options: {
          colorScheme: 'light',
          darkModeSelector: '.my-app-dark',
          cssLayer: {
            name: 'primeng',
            order: 'theme, base, primeng',
          },
        },
      },
    }),
  ],
})
  .then((moduleRef) => {
    const applicationRef = moduleRef.injector.get(ApplicationRef);
    const appComponent = applicationRef.components[0];
    enableDebugTools(appComponent);
  })
  .catch((err) => console.error(err));
