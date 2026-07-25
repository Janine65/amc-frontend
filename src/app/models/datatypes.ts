import { TableData } from '../components/shared/basetable/basetable-types';
import { User } from './user';

type NumberEmpty = number | null | undefined;
type StringEmpty = string | null | undefined;
type DateEmpty = Date | null | undefined;
type BooleanEmpty = boolean | null | undefined;

export class OverviewData {
  constructor(public label: string, public value: string) {}
}

/*
'Aktive Mitglieder'
'SAM Mitglieder'
'Freimitglieder'
'Total Anlässe'
'Zukünftige Anlässe'
'Clubmeisterschaft'
'Kegelmeisterschaft'
'Buchhaltung'
*/

export class ParamData {
  constructor(public id: number, public key: string, public value: string) {}
}

export class Adresse extends TableData {
  public mnr?: NumberEmpty;
  public geschlecht?: StringEmpty;
  public name?: StringEmpty;
  public vorname?: StringEmpty;
  public fullname?: StringEmpty;
  public adresse?: StringEmpty;
  public plz?: NumberEmpty;
  public ort?: StringEmpty;
  public land?: StringEmpty;
  public telefon_p?: StringEmpty;
  public telefon_g?: StringEmpty;
  public mobile?: StringEmpty;
  public email?: StringEmpty;
  public sam_mitglied?: BooleanEmpty;
  public eintritt?: StringEmpty;
  public eintritt_date?: DateEmpty;
  public jahresbeitrag?: NumberEmpty;
  public mnr_sam?: NumberEmpty;
  public vorstand?: BooleanEmpty;
  public ehrenmitglied?: BooleanEmpty;
  public revisor?: BooleanEmpty;
  public austritt?: StringEmpty;
  public austritt_date?: DateEmpty;
  public austritt_mail?: BooleanEmpty;
  public adressenid?: NumberEmpty;
  public adressen?: Adresse;
  public allianz?: BooleanEmpty;
  public notes?: StringEmpty;
}

export class Anlass extends TableData {
  public datum?: StringEmpty;
  public datum_date?: DateEmpty;
  public name?: StringEmpty;
  public beschreibung?: StringEmpty;
  public punkte?: NumberEmpty;
  public istkegeln?: BooleanEmpty;
  public nachkegeln?: BooleanEmpty;
  public istsamanlass?: BooleanEmpty;
  public gaeste?: NumberEmpty;
  public anlaesseid?: NumberEmpty;
  public longname?: StringEmpty;
  public status?: NumberEmpty;
  public vorjahr?: StringEmpty;
  public anlaesse?: Anlass;
  public _count?: { meisterschaft: number };
}

export class Meisterschaft extends TableData {
  public mitgliedid?: NumberEmpty;
  public eventid?: NumberEmpty;
  public anlaesse?: Anlass;
  public punkte?: NumberEmpty;
  public wurf1?: NumberEmpty;
  public wurf2?: NumberEmpty;
  public wurf3?: NumberEmpty;
  public wurf4?: NumberEmpty;
  public wurf5?: NumberEmpty;
  public zusatz?: NumberEmpty;
  public streichresultat?: NumberEmpty;
  public total_kegel?: NumberEmpty;
  public adressen?: { id?: NumberEmpty; fullname?: StringEmpty };
  public jahr?: NumberEmpty;
  public datum?: StringEmpty;
  public event_datum_date?: DateEmpty;
  public name?: StringEmpty;
  public total_kegeln?: NumberEmpty;
}

export class Clubmeister extends TableData {
  jahr?: NumberEmpty;
  rang?: NumberEmpty;
  vorname?: StringEmpty;
  nachname?: StringEmpty;
  mitgliedid?: NumberEmpty;
  punkte?: NumberEmpty;
  anlaesse?: NumberEmpty;
  werbungen?: NumberEmpty;
  mitglieddauer?: NumberEmpty;
  status?: NumberEmpty;
  adressen?: Adresse;
}

export class Kegelmeister extends TableData {
  jahr?: NumberEmpty;
  rang?: NumberEmpty;
  vorname?: StringEmpty;
  nachname?: StringEmpty;
  mitgliedid?: NumberEmpty;
  punkte?: NumberEmpty;
  anlaesse?: NumberEmpty;
  babeli?: NumberEmpty;
  status?: NumberEmpty;
  adressen?: Adresse;
}

export class MeisterAdresse extends TableData {
  jahr?: NumberEmpty;
  rangC?: NumberEmpty;
  punkteC?: NumberEmpty;
  anlaesseC?: NumberEmpty;
  werbungenC?: NumberEmpty;
  mitglieddauerC?: NumberEmpty;
  statusC?: NumberEmpty;
  diffErsterC?: NumberEmpty;
  rangK?: NumberEmpty;
  punkteK?: NumberEmpty;
  anlaesseK?: NumberEmpty;
  babeliK?: NumberEmpty;
  statusK?: NumberEmpty;
  diffErsterK?: NumberEmpty;
}

export class Fiscalyear extends TableData {
  year?: StringEmpty;
  name?: StringEmpty;
  state?: NumberEmpty;
}

export class Account extends TableData {
  name?: StringEmpty;
  level?: NumberEmpty;
  order?: NumberEmpty;
  status?: NumberEmpty;
  longname?: StringEmpty;
  amount?: NumberEmpty;
  disabled?: boolean;
}

export class Receipt extends TableData {
  receipt?: StringEmpty;
  bezeichnung?: StringEmpty;
  jahr?: StringEmpty;
  cntjournal?: NumberEmpty;
  journal_receipt?: JournalReceipt[];
}
export class JournalReceipt extends TableData {
  journalid?: NumberEmpty;
  receiptid?: NumberEmpty;
  journal?: Journal;
  receipt?: Receipt;
}

export class Journal extends TableData {
  date?: StringEmpty;
  date_date?: DateEmpty;
  year?: NumberEmpty;
  memo?: StringEmpty;
  journalno?: NumberEmpty;
  amount?: NumberEmpty;
  status?: NumberEmpty;
  from_account?: NumberEmpty;
  fromAcc?: StringEmpty;
  to_account?: NumberEmpty;
  toAcc?: StringEmpty;
  account_journal_from_accountToaccount?: Account;
  account_journal_to_accountToaccount?: Account;
  haben?: NumberEmpty;
  soll?: NumberEmpty;
  journal_receipt?: JournalReceipt[];
}

export class Kegelkasse extends TableData {
  datum?: StringEmpty;
  datum_date?: DateEmpty;
  kasse?: NumberEmpty;
  rappen5?: NumberEmpty;
  rappen10?: NumberEmpty;
  rappen20?: NumberEmpty;
  rappen50?: NumberEmpty;
  franken1?: NumberEmpty;
  franken2?: NumberEmpty;
  franken5?: NumberEmpty;
  franken10?: NumberEmpty;
  franken20?: NumberEmpty;
  franken50?: NumberEmpty;
  franken100?: NumberEmpty;
  total?: NumberEmpty;
  differenz?: NumberEmpty;
  journal?: Journal;
  journalid?: NumberEmpty;
  user?: User;
  userid?: NumberEmpty;
  userName?: StringEmpty;
  amountProUser?: NumberEmpty;
  cntUsers?: NumberEmpty;
}

export class Budget extends TableData {
  account?: NumberEmpty;
  year?: NumberEmpty;
  amount?: NumberEmpty;
  memo?: StringEmpty;
  account_budget_accountToaccount?: Account;
  acc_order?: NumberEmpty;
  acc_id?: NumberEmpty;
  acc_name?: StringEmpty;
}
export class MeisterschaftAuswertung {
  public datum?: StringEmpty;
  public name?: StringEmpty;
  public gaeste?: NumberEmpty;
  public _count?: { meisterschaft?: NumberEmpty };
}

export class AccountAuswertung {
  $css = '';
  amount = 0;
  budget = 0;
  diff = 0;
  id = 0;
  level = 0;
  name = '';
  order = 0;
  status = 0;
}
