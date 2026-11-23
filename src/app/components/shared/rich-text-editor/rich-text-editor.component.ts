import {
  afterNextRender,
  Component,
  DestroyRef,
  ElementRef,
  forwardRef,
  inject,
  input,
  NgZone,
  signal,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import DOMPurify from 'dompurify';
import type { Jodit } from 'jodit';

@Component({
  selector: 'app-rich-text-editor',
  template: `
    <textarea
      #source
      class="w-full"
      [value]="value"
      [placeholder]="placeholder()"
      [attr.aria-label]="placeholder()"
      [disabled]="disabled"
      (input)="update(source.value)"
      (blur)="markTouched()"
    ></textarea>
    @if (loadFailed()) {
      <p role="alert">Der Rich-Text-Editor konnte nicht geladen werden. HTML kann direkt bearbeitet werden.</p>
    }
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RichTextEditorComponent),
      multi: true,
    },
  ],
})
export class RichTextEditorComponent implements ControlValueAccessor {
  readonly placeholder = input.required<string>();
  readonly height = input.required<number>();
  readonly email = input(false);
  protected readonly loadFailed = signal(false);

  private readonly source = viewChild.required<ElementRef<HTMLTextAreaElement>>('source');
  private readonly destroyRef = inject(DestroyRef);
  private readonly zone = inject(NgZone);
  private editor?: Jodit;
  protected value = '';
  protected disabled = false;
  private onChange: (value: string) => void = () => {};
  private onTouched = () => {};

  constructor() {
    afterNextRender(() => this.zone.runOutsideAngular(() => void this.initEditor()));
    this.destroyRef.onDestroy(() => this.editor?.destruct());
  }

  private async initEditor(): Promise<void> {
    try {
      const { Jodit } = await import('jodit');
      if (this.destroyRef.destroyed) return;
      this.editor = Jodit.make(this.source().nativeElement, {
        language: 'de',
        height: this.height(),
        minHeight: this.height(),
        placeholder: this.placeholder(),
        toolbarAdaptive: false,
        buttons: [
          'bold', 'italic', 'underline', 'strikethrough', 'paragraph',
          'ul', 'ol', 'outdent', 'indent', 'align', 'fontsize', 'brush',
          'link', 'image',
          ...(this.email() ? ['font', 'superscript', 'subscript'] : []),
          'eraser', 'undo', 'redo',
        ],
        uploader: { insertImageAsBase64URI: true },
        askBeforePasteHTML: false,
        askBeforePasteFromWord: false,
        defaultActionOnPaste: 'insert_clear_html',
      });
      this.editor.editor.setAttribute('aria-label', this.placeholder());
      this.editor.value = this.value;
      this.editor.setDisabled(this.disabled);
      this.editor.events.on('change', (html: string) => this.zone.run(() => this.update(html)));
      this.editor.events.on('blur', () => this.zone.run(() => this.markTouched()));
    } catch (error) {
      if (this.destroyRef.destroyed) return;
      this.editor?.destruct();
      this.editor = undefined;
      console.error('Rich-Text-Editor konnte nicht geladen werden.', error);
      this.loadFailed.set(true);
    }
  }

  writeValue(html: string | null | undefined): void {
    this.value = this.sanitize(html ?? '');
    if (this.editor && this.editor.value !== this.value) {
      this.editor.value = this.value;
    }
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.disabled = disabled;
    this.editor?.setDisabled(disabled);
  }

  protected update(html: string): void {
    const value = this.sanitize(html);
    if (value === this.value) return;
    this.value = value;
    this.onChange(value);
  }

  protected markTouched(): void {
    this.onTouched();
  }

  private sanitize(html: string): string {
    return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
  }
}
