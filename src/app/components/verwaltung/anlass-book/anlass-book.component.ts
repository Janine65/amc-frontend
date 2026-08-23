import {
  Component,
  DestroyRef,
  HostListener,
  inject,
  OnInit,
  Renderer2,
  signal,
  viewChild,
  ChangeDetectionStrategy
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormControl,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Adresse, Anlass, Meisterschaft } from '@model/datatypes';
import { BackendService } from '@app/service';
import { MessageService } from 'primeng/api';
import { AutoComplete } from 'primeng/autocomplete';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { Subscription, map, switchMap, zip } from 'rxjs';
import { Bind } from 'primeng/bind';
import { Toast } from 'primeng/toast';
import { Splitter } from 'primeng/splitter';
import { ButtonDirective } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { Toolbar } from 'primeng/toolbar';

interface AutoCompleteCompleteEvent {
  originalEvent: Event;
  query: string;
}

@Component({
  selector: 'app-anlass-book',
  templateUrl: './anlass-book.component.html',
  styleUrls: ['./anlass-book.component.scss'],
  providers: [DialogService],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    Bind,
    Toast,
    Splitter,
    FormsModule,
    ButtonDirective,
    TableModule,
    ReactiveFormsModule,
    AutoComplete,
    Toolbar,
  ],
})
export class AnlassBookComponent implements OnInit {
  private backendService = inject(BackendService);
  ref = inject(DynamicDialogRef);
  config = inject(DynamicDialogConfig);
  private dialogService = inject(DialogService);
  private messageService = inject(MessageService);

  anlass: Anlass = {
    datum: undefined,
    datum_date: undefined,
    name: undefined,
    beschreibung: undefined,
    punkte: undefined,
    istkegeln: undefined,
    nachkegeln: undefined,
    istsamanlass: undefined,
    gaeste: undefined,
    anlaesseid: undefined,
    longname: undefined,
    status: undefined,
    vorjahr: undefined,
    anlaesse: undefined,
  };
  lstMeisterschaft = signal<Meisterschaft[]>([]);
  selMeisterschaft: Meisterschaft = {
    mitgliedid: undefined,
    eventid: undefined,
    punkte: undefined,
    wurf1: undefined,
    wurf2: undefined,
    wurf3: undefined,
    wurf4: undefined,
    wurf5: undefined,
    zusatz: undefined,
    streichresultat: undefined,
    total_kegel: undefined,
    adressen: undefined,
  };
  newMeisterschaft: Meisterschaft = {
    mitgliedid: undefined,
    eventid: undefined,
    punkte: undefined,
    wurf1: undefined,
    wurf2: undefined,
    wurf3: undefined,
    wurf4: undefined,
    wurf5: undefined,
    zusatz: 5,
    streichresultat: undefined,
    total_kegel: undefined,
    adressen: undefined,
  };
  fMeisterschaft = false;
  lstAdressen: Adresse[] = [];
  readonly lstFilteredAdressen = signal<Adresse[]>([]);
  selAdresse?: number;
  subFields: Subscription[] = [];
  private readonly destroyRef = inject(DestroyRef);

  public objHeight$ = signal('0px');
  public objHeightE$ = signal('0px');
  getScreenWidth = 0;
  getScreenHeight = 0;

  private readonly teilnehmerObject =
    viewChild.required<AutoComplete>('teilnehmername');

  fgMeisterschaft = new FormGroup({
    teilnehmername: new FormControl<Adresse | null>(
      { value: null, disabled: false },
      Validators.required,
    ),
    punkte: new FormControl<number | null>({ value: null, disabled: true }, [
      Validators.required,
      Validators.min(0),
      Validators.max(200),
    ]),
    wurf1: new FormControl<number | null>({ value: null, disabled: true }, [
      Validators.min(0),
      Validators.max(9),
    ]),
    wurf2: new FormControl<number | null>({ value: null, disabled: true }, [
      Validators.min(0),
      Validators.max(9),
    ]),
    wurf3: new FormControl<number | null>({ value: null, disabled: true }, [
      Validators.min(0),
      Validators.max(9),
    ]),
    wurf4: new FormControl<number | null>({ value: null, disabled: true }, [
      Validators.min(0),
      Validators.max(9),
    ]),
    wurf5: new FormControl<number | null>({ value: null, disabled: true }, [
      Validators.min(0),
      Validators.max(9),
    ]),
    zusatz: new FormControl<number | null>({ value: null, disabled: true }),
    total: new FormControl<number | null>({ value: null, disabled: true }),
  });

  @HostListener('window:resize')
  onWindowResize() {
    this.getScreenWidth = window.innerWidth;
    this.getScreenHeight = window.innerHeight;
    this.getHeight();
  }

  private renderer = inject(Renderer2);

  constructor() {
    const config = this.config;

    this.anlass = config.data.anlass;

    zip(
      this.backendService.getMeisterschaft(this.anlass.id!),
      this.backendService.getAdressenData(),
    )
      .pipe(
        map(([list1, list2]) => {
          this.lstMeisterschaft.set(list1.data as Meisterschaft[]);
          this.lstAdressen = list2.data as Adresse[];
          this.lstAdressen.forEach(
            (adr) => (adr.fullname = adr.vorname + ' ' + adr.name),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }
  private focusTeilnehmer() {
    const ac = this.teilnehmerObject();
    const el = ac.inputEL()?.nativeElement as HTMLInputElement | undefined;
    if (el) el.focus();
    ac.focused.set(true);
  }

  ngOnInit(): void {
    this.getScreenWidth = window.innerWidth;
    this.getScreenHeight = window.innerHeight;
    this.getHeight();
  }

  back() {
    this.ref.close();
  }

  get teilnehmername() {
    return this.fgMeisterschaft.get('teilnehmername')!;
  }
  get punkte() {
    return this.fgMeisterschaft.get('punkte')!;
  }
  get wurf1() {
    return this.fgMeisterschaft.get('wurf1')!;
  }
  get wurf2() {
    return this.fgMeisterschaft.get('wurf2')!;
  }
  get wurf3() {
    return this.fgMeisterschaft.get('wurf3')!;
  }
  get wurf4() {
    return this.fgMeisterschaft.get('wurf4')!;
  }
  get wurf5() {
    return this.fgMeisterschaft.get('wurf5')!;
  }
  get zusatz() {
    return this.fgMeisterschaft.get('zusatz')!;
  }
  get total() {
    return this.fgMeisterschaft.get('total')!;
  }

  private getHeight() {
    this.objHeight$.set((this.getScreenHeight-400).toFixed(0) + 'px');
    this.objHeightE$.set((this.getScreenHeight-550).toFixed(0) + 'px');
  }

  inputWurf(wurfControl: number) {
    const value = this.fgMeisterschaft.get('wurf' + wurfControl)?.value;

    let total = 0;

    for (let ind = 1; ind < 6; ind++) {
      const wurf = this.fgMeisterschaft.get('wurf' + ind)?.value;
      if (wurf != null) total += wurf;
    }
    const zusatz = this.zusatz.value;
    if (zusatz != null) total += zusatz;

    this.total.setValue(total);
    if (value == null) return;

    if (wurfControl < 5)
      this.renderer.selectRootElement('#wurf' + (wurfControl + 1)).focus();
    // else
    //   this.renderer.selectRootElement('#save').focus();
  }

  setDisabled(disabled: boolean) {
    if (disabled) {
      this.punkte.disable();
      if (this.anlass.istkegeln) {
        this.wurf1.disable();
        this.wurf2.disable();
        this.wurf3.disable();
        this.wurf4.disable();
        this.wurf5.disable();
      }
    } else {
      this.punkte.enable();
      if (this.anlass.istkegeln) {
        this.wurf1.enable();
        this.wurf2.enable();
        this.wurf3.enable();
        this.wurf4.enable();
        this.wurf5.enable();
      }
    }
  }

  clearMeisterschaft() {
    this.unsubscribeList();
    this.newMeisterschaft = {};
    this.patchFields();

    this.setDisabled(true);
  }

  clearTeilnehmer() {
    this.clearMeisterschaft();
    this.lstFilteredAdressen.set([]);

    this.teilnehmername.reset(null);
    this.focusTeilnehmer();
    this.setDisabled(true);
  }

  saveGaeste() {
    this.backendService.updAnlaesseData(this.anlass).subscribe({
      complete: () => {
        this.messageService.add({
          detail: 'Die Daten wurden gespeicher. ',
          sticky: false,
          closable: true,
          severity: 'info',
          summary: 'Gäste speichern',
        });
      },
    });
  }

  deleteEntry() {
    if (this.selMeisterschaft && this.selMeisterschaft.id) {
    this.backendService.delMeisterschaft(this.selMeisterschaft).subscribe({
      complete: () => {
        this.lstMeisterschaft.set(
          this.lstMeisterschaft().filter((m) => m !== this.selMeisterschaft),
        );
        this.messageService.add({
          detail: 'Der Eintrag wurde gelöscht. ',
          sticky: false,
          closable: true,
          severity: 'info',
          summary: 'Meisterschaft löschen',
        });
      },
    });
    this.clearTeilnehmer();
    }
  }

  selTeilnehmerTable() {
    this.newMeisterschaft = { ...this.selMeisterschaft };
    this.unsubscribeList();
    this.lstFilteredAdressen.set([]);
    const adr = this.lstAdressen.find(
      (rec) => rec.id == this.selMeisterschaft.mitgliedid!,
    );
    if (!adr) {
      this.messageService.add({
        closable: true,
        sticky: false,
        detail: 'Fehler aufgetreten! Adresse konnte nicht gefunden werden',
        severity: 'error',
        summary: 'selTeilnehmerTable',
      });
      return;
    }
    this.teilnehmername.setValue(adr);
    this.focusTeilnehmer();
    this.patchFields();
    this.fgMeisterschaft.markAsUntouched({ onlySelf: false });

    this.setDisabled(false);
    if (this.anlass.istkegeln)
      this.renderer.selectRootElement('#wurf1').focus();
    else this.renderer.selectRootElement('#punkte').focus();

    this.subscribeWurfChanges();
  }

  selectTeilnehmer(adr: Adresse) {
    this.lstFilteredAdressen.set([adr]);
    this.teilnehmername.setValue(adr);
    this.unsubscribeList();
    this.setDisabled(false);

    this.newMeisterschaft =
      this.lstMeisterschaft().find((rec) => rec.mitgliedid == adr.id) ??
      new Meisterschaft();
    if (this.newMeisterschaft.eventid == undefined) {
      this.newMeisterschaft.eventid = this.anlass.id;
      this.newMeisterschaft.mitgliedid = adr.id;
      this.newMeisterschaft.punkte = this.anlass.punkte;
      this.newMeisterschaft.adressen = { id: adr.id!, fullname: adr.fullname! };
      this.newMeisterschaft.zusatz =
        this.anlass.istkegeln && !this.anlass.nachkegeln ? 5 : 0;
      this.patchFields();
      this.fgMeisterschaft.markAllAsTouched();
    } else {
      this.patchFields();
      this.fgMeisterschaft.markAsUntouched({ onlySelf: false });
    }

    if (this.anlass.istkegeln)
      this.renderer.selectRootElement('#wurf1').focus();
    else this.renderer.selectRootElement('#punkte').focus();

    this.subscribeWurfChanges();
  }

  searchTeilnehmer(event: AutoCompleteCompleteEvent) {
    this.clearMeisterschaft();

    const lstString = event.query.split(' ');
    if (!lstString || lstString.length == 0) {
      this.lstFilteredAdressen.set([]);
      return;
    }

    const filtered = this.lstAdressen.filter((adr) => {
      let match = false;
      lstString.forEach((text) => {
        const escaped = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escaped, 'i');
        const matchL = adr.name!.match(regex);
        const matchV = adr.vorname!.match(regex);
        if (matchL || matchV) match = true;
      });
      return match;
    });
    this.lstFilteredAdressen.set(filtered);
    if (filtered.length == 1) {
      this.teilnehmername.patchValue(
        { fullname: filtered[0].fullname },
        { onlySelf: true, emitEvent: true, emitModelToViewChange: true },
      );
    }
  }

  onTeilnehmerTab(event: Event) {
    const filtered = this.lstFilteredAdressen();
    if (filtered.length === 1) {
      event.preventDefault();
      this.selectTeilnehmer(filtered[0]);
    }
  }

  unsubscribeList() {
    this.subFields.forEach((sub) => sub.unsubscribe());
    this.subFields = [];
  }

  private subscribeWurfChanges() {
    if (!this.anlass.istkegeln) return;
    for (let i = 1; i <= 5; i++) {
      const ctrl = this.fgMeisterschaft.get('wurf' + i);
      if (!ctrl) continue;
      this.subFields.push(ctrl.valueChanges.subscribe(() => this.inputWurf(i)));
    }
  }

  patchFields() {
    this.fgMeisterschaft.patchValue({
      punkte: this.newMeisterschaft.punkte,
      wurf1: this.newMeisterschaft.wurf1,
      wurf2: this.newMeisterschaft.wurf2,
      wurf3: this.newMeisterschaft.wurf3,
      wurf4: this.newMeisterschaft.wurf4,
      wurf5: this.newMeisterschaft.wurf5,
      zusatz: this.newMeisterschaft.zusatz,
      total: this.newMeisterschaft.total_kegel,
    });
  }

  save() {
    if (this.fgMeisterschaft.invalid) {
      this.messageService.add({
        detail:
          'Die Daten sind noch nicht korrekt und können nicht gespeichert werden',
        closable: true,
        severity: 'error',
        summary: 'Meisterschaft speichern',
      });
      return;
    }

    if (this.fgMeisterschaft.untouched) {
      this.messageService.add({
        detail:
          'Die Daten wurden nicht geändert. Es ist kein Speichern notwendig',
        sticky: false,
        closable: true,
        severity: 'info',
        summary: 'Meisterschaft speichern',
      });
      return;
    }

    this.newMeisterschaft.punkte = this.punkte.value ? this.punkte.value : 0;
    this.newMeisterschaft.wurf1 = this.wurf1.value ? this.wurf1.value : null;
    this.newMeisterschaft.wurf2 = this.wurf2.value ? this.wurf2.value : null;
    this.newMeisterschaft.wurf3 = this.wurf3.value ? this.wurf3.value : null;
    this.newMeisterschaft.wurf4 = this.wurf4.value ? this.wurf4.value : null;
    this.newMeisterschaft.wurf5 = this.wurf5.value ? this.wurf5.value : null;
    this.newMeisterschaft.zusatz = this.zusatz.value ? this.zusatz.value : 0;
    this.newMeisterschaft.total_kegel = this.total.value
      ? this.total.value
      : null;

    const req$ = (this.newMeisterschaft.id)
      ? this.backendService.updMeisterschaft(this.newMeisterschaft)
      : this.backendService.addMeisterschaft(this.newMeisterschaft);

    req$.pipe(
      switchMap(() => this.backendService.getMeisterschaft(this.anlass.id!)),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(list => {
      this.selMeisterschaft = { /* leere Instanz */ };   // wichtig!
      this.lstMeisterschaft.set([...(list.data as Meisterschaft[])]);
      this.clearTeilnehmer();
    });
  }
  reset() {
    this.clearTeilnehmer();
  }
}
