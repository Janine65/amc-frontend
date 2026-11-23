import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { commonTestProviders } from '@app/testing/test-providers';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';

import { EmailDialogComponent } from './email-dialog.component';
import { RichTextEditorComponent } from '../rich-text-editor/rich-text-editor.component';

describe('EmailDialogComponent', () => {
  let component: EmailDialogComponent;
  let fixture: ComponentFixture<EmailDialogComponent>;
  const innerText = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'innerText');

  beforeAll(() => {
    if (innerText) return;
    Object.defineProperty(HTMLElement.prototype, 'innerText', {
      configurable: true,
      get(this: HTMLElement) {
        return this.textContent ?? '';
      },
      set(this: HTMLElement, value: string) {
        this.textContent = value;
      },
    });
  });

  afterAll(() => {
    if (!innerText) Reflect.deleteProperty(HTMLElement.prototype, 'innerText');
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmailDialogComponent],
      providers: [
        ...commonTestProviders,
        {
          provide: DynamicDialogConfig,
          useValue: {
            data: {
              emailBody: {
                email_an: '',
                email_cc: '',
                email_bcc: '',
                email_subject: '',
                email_body: '',
              },
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EmailDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads stored HTML in Jodit and synchronizes formatted edits with the email body', async () => {
    component.emailBody.email_body = '<p><strong>Vorhandene Meldung</strong></p>';
    fixture.detectChanges();
    await import('jodit');
    const field = fixture.debugElement.query(By.directive(RichTextEditorComponent));
    const editor: HTMLElement = field.nativeElement.querySelector('.jodit-wysiwyg');
    expect(editor.querySelector('strong')?.textContent).toBe('Vorhandene Meldung');

    editor.innerHTML = '<p><em>Neue Meldung</em></p>';
    editor.dispatchEvent(new Event('input', { bubbles: true }));
    expect(component.emailBody.email_body).toBe('<p><em>Neue Meldung</em></p>');
  });

  it('removes disallowed markup while preserving stored formatting', async () => {
    component.emailBody.email_body =
      '<p style="text-align: center"><strong>Vorhandene Meldung</strong><iframe title="Extern"></iframe></p>';
    fixture.detectChanges();
    await import('jodit');
    const field = fixture.debugElement.query(By.directive(RichTextEditorComponent));
    const editor: HTMLElement = field.nativeElement.querySelector('.jodit-wysiwyg');

    expect(editor.querySelector('iframe')).toBeNull();
    expect(editor.querySelector('p')?.style.textAlign).toBe('center');
    expect(editor.querySelector('strong')?.textContent).toBe('Vorhandene Meldung');
  });
});
