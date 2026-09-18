import { HttpHeaders, HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@environments/environment';
import {
  ParamData,
  Fiscalyear,
  Adresse,
  Anlass,
  Meisterschaft,
  Journal,
  Account,
  Kegelkasse,
  Receipt,
  Budget,
  HomepageNews,
  HomepageBericht,
  AnlassAnmeldung,
  JahrFreigabe,
} from '@model/index';
import { Package } from '@model/user';
import { EmailBody } from '@app/components/shared/email-dialog/email-dialog.types';
import { Observable } from 'rxjs';

export interface RetData {
  data: object | undefined;
  message: string;
  type: string;
}

export interface RetDataFiles extends RetData {
  data: { files: string[] } | undefined;
}

export interface RetDataFile extends RetData {
  data: { filename: string } | undefined;
}

export interface SheetParameter {
  jahr: number;
  type: number;
  id: number | null;
}

@Injectable({ providedIn: 'root' })
export class BackendService {
  private http = inject(HttpClient);

  private header!: HttpHeaders;
  private backendApiUrl: string = '';

  constructor() {
    this.header = new HttpHeaders({
      'Access-Control-Allow-Origin': environment.apiUrlSelf,
      'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      'Access-Control-Allow-Headers':
        'Access-Control-Allow-Headers,Access-Control-Allow-Methods,Access-Control-Allow-Origin, Origin, X-Requested-With, Content-Type, Accept, Authorization, Content-Disposition',
      'Content-Type': 'application/json',
      // Verhindert veraltete Antworten hinter Reverse-Proxies (z.B. Synology DSM).
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
    });
    this.backendApiUrl = environment.apiUrl;
  }

  getAbout(): Observable<Package> {
    const apiURL = this.backendApiUrl + '/about';
    return this.http.get<Package>(apiURL, { headers: this.header });
  }

  uploadFiles(file: File): Observable<RetData> {
    const apiURL = this.backendApiUrl + '/files/upload';
    const data = new FormData();
    data.append('file', file);
    const headers: HttpHeaders = new HttpHeaders({
      'Access-Control-Allow-Origin': environment.apiUrlSelf,
      'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      'Access-Control-Allow-Headers':
        'Access-Control-Allow-Headers,Access-Control-Allow-Methods,Access-Control-Allow-Origin, Origin, X-Requested-With, Content-Type, Accept, Authorization',
    });
    const req = this.http.post<RetData>(apiURL, data, { headers: headers });
    return req;
  }

  downloadFile(filename: string): Observable<HttpResponse<Blob>> {
    const apiURL = this.backendApiUrl + '/files/download?filename=' + filename;
    return this.http.get(apiURL, {
      headers: this.header,
      responseType: 'blob',
      observe: 'response',
    });
  }

  getParameterData(): Observable<RetData> {
    const apiURL = this.backendApiUrl + '/parameter';
    return this.http.get<RetData>(apiURL, { headers: this.header });
  }

  updParameterData(parameter: ParamData): Observable<RetData> {
    const apiURL = this.backendApiUrl + '/parameter/' + parameter.id;
    const body = JSON.stringify(parameter);
    return this.http.patch<RetData>(apiURL, body, { headers: this.header });
  }

  addParameterData(parameter: ParamData): Observable<RetData> {
    const apiURL = this.backendApiUrl + '/parameter';
    const body = JSON.stringify(parameter);
    return this.http.post<RetData>(apiURL, body, { headers: this.header });
  }

  delParameterData(parameter: ParamData): Observable<RetData> {
    const apiURL = this.backendApiUrl + '/parameter/' + parameter.id;
    return this.http.delete<RetData>(apiURL, { headers: this.header });
  }

  getDashboarJournalData(jahr: string): Observable<RetData> {
    const apiURL = this.backendApiUrl + '/fiscalyear/getbyyear?year=' + jahr;
    return this.http.get<RetData>(apiURL, { headers: this.header });
  }

  getDashboardAdressData(): Observable<RetData> {
    const apiURL = this.backendApiUrl + '/adressen/overview';
    return this.http.get<RetData>(apiURL, { headers: this.header });
  }
  getDashboardAnlaesseData(): Observable<RetData> {
    const apiURL = this.backendApiUrl + '/anlaesse/overview';
    return this.http.get<RetData>(apiURL, { headers: this.header });
  }
  getDashboardClubmeisterData(): Observable<RetData> {
    const apiURL = this.backendApiUrl + '/clubmeister/overview';
    return this.http.get<RetData>(apiURL, { headers: this.header });
  }
  getDashboardKegelmeisterData(): Observable<RetData> {
    const apiURL = this.backendApiUrl + '/kegelmeister/overview';
    return this.http.get<RetData>(apiURL, { headers: this.header });
  }
  getAdressenData(): Observable<RetData> {
    const apiURL = this.backendApiUrl + '/adressen';
    return this.http.get<RetData>(apiURL, { headers: this.header });
  }

  getAdressenFK(): Observable<RetData> {
    const apiURL = this.backendApiUrl + '/adressen/getFkData';
    return this.http.get<RetData>(apiURL, { headers: this.header });
  }

  getOneAdress(id: number): Observable<RetData> {
    const apiURL = this.backendApiUrl + '/adressen/' + id;
    return this.http.get<RetData>(apiURL, { headers: this.header });
  }

  updateAdresse(adresse: Adresse): Observable<RetData> {
    const body = JSON.stringify(adresse);
    if (adresse.id == undefined || adresse.id == 0) {
      return this.http.post<RetData>(this.backendApiUrl + '/adressen', body, {
        headers: this.header,
      });
    } else {
      return this.http.patch<RetData>(
        this.backendApiUrl + '/adressen/' + adresse.id,
        body,
        { headers: this.header },
      );
    }
  }

  removeAdresse(adresse: Adresse): Observable<RetData> {
    const apiURL = this.backendApiUrl + '/adressen/' + adresse.id;
    const body = JSON.stringify(adresse);
    return this.http.delete<RetData>(apiURL, {
      headers: this.header,
      body: body,
    });
  }

  exportAdressData(adressen: Adresse[]): Observable<RetDataFile> {
    const apiURL = this.backendApiUrl + '/adressen/export';
    const body = JSON.stringify(adressen);
    return this.http.post<RetDataFile>(apiURL, body, { headers: this.header });
  }

  sendEmail(emailbody: EmailBody): Observable<RetData> {
    const apiURL = this.backendApiUrl + '/adressen/sendmail';
    const body = JSON.stringify(emailbody);
    return this.http.post<RetData>(apiURL, body, { headers: this.header });
  }

  qrBillAdresse(adresse: Adresse): Observable<RetData> {
    const apiURL = this.backendApiUrl + '/adressen/qrbill?id=' + adresse.id;
    return this.http.get<RetData>(apiURL, { headers: this.header });
  }

  // TODO: Filter muss noch eingebaut werden
  getAnlaesseData(
    fromJahr: string,
    toJahr: string,
    istkegeln: boolean | undefined,
  ): Observable<RetData> {
    const params = new URLSearchParams();
    params.append('fromJahr', fromJahr);
    params.append('toJahr', toJahr);
    if (istkegeln) params.append('istkegeln', istkegeln.toString());
    const apiURL = this.backendApiUrl + '/anlaesse?' + params.toString();
    return this.http.get<RetData>(apiURL, { headers: this.header });
  }

  getAnlaesseFKData(jahr: string | undefined): Observable<RetData> {
    const params = new URLSearchParams();
    if (jahr) params.append('jahr', jahr);
    const apiURL =
      this.backendApiUrl + '/anlaesse/getFkData?' + params.toString();
    return this.http.get<RetData>(apiURL, { headers: this.header });
  }

  addAnlaesseData(anlass: Anlass): Observable<RetData> {
    const apiURL = this.backendApiUrl + '/anlaesse';
    const body = JSON.stringify(anlass);
    return this.http.post<RetData>(apiURL, body, { headers: this.header });
  }

  updAnlaesseData(anlass: Anlass): Observable<RetData> {
    const apiURL = this.backendApiUrl + '/anlaesse/' + anlass.id;
    const body = JSON.stringify(anlass);
    return this.http.patch<RetData>(apiURL, body, { headers: this.header });
  }

  delAnlaesseData(anlass: Anlass): Observable<RetData> {
    const apiURL = this.backendApiUrl + '/anlaesse/' + anlass.id;
    const body = JSON.stringify(anlass);
    return this.http.delete<RetData>(apiURL, {
      headers: this.header,
      body: body,
    });
  }

  getSheet(parameter: SheetParameter): Observable<RetDataFile> {
    const params = new URLSearchParams();
    params.append('jahr', parameter.jahr.toString());
    params.append('type', parameter.type.toString());
    if (parameter.id && parameter.id > 0)
      params.append('adresseId', parameter.id.toString());
    const apiURL =
      this.backendApiUrl + '/anlaesse/writestammblatt?' + params.toString();
    return this.http.get<RetDataFile>(apiURL, { headers: this.header });
  }

  getOneAnlass(id: number): Observable<RetData> {
    const apiURL = this.backendApiUrl + '/anlaesse/' + id;
    return this.http.get<RetData>(apiURL, { headers: this.header });
  }

  getAdresseMeisterschaft(adresseid: number): Observable<RetData> {
    const apiURL =
      this.backendApiUrl +
      '/meisterschaft/listmitglied?mitgliedid=' +
      adresseid;
    return this.http.get<RetData>(apiURL, { headers: this.header });
  }

  getAdresseMeister(adresseid: number): Observable<RetData> {
    const apiURL =
      this.backendApiUrl +
      '/meisterschaft/listmitgliedmeister?mitgliedid=' +
      adresseid;
    return this.http.get<RetData>(apiURL, { headers: this.header });
  }

  getMeisterschaft(eventid: number): Observable<RetData> {
    const apiURL =
      this.backendApiUrl +
      '/meisterschaft/listevent?eventid=' +
      eventid +
      '&_ts=' +
      Date.now();
    return this.http.get<RetData>(apiURL, { headers: this.header });
  }

  addMeisterschaft(meisterschaft: Meisterschaft): Observable<RetData> {
    const apiURL = this.backendApiUrl + '/meisterschaft';
    const body = JSON.stringify(meisterschaft);
    return this.http.post<RetData>(apiURL, body, { headers: this.header });
  }

  updMeisterschaft(meisterschaft: Meisterschaft): Observable<RetData> {
    const apiURL = this.backendApiUrl + '/meisterschaft/' + meisterschaft.id;
    const body = JSON.stringify(meisterschaft);
    return this.http.patch<RetData>(apiURL, body, { headers: this.header });
  }

  delMeisterschaft(meisterschaft: Meisterschaft): Observable<RetData> {
    const apiURL = this.backendApiUrl + '/meisterschaft/' + meisterschaft.id;
    return this.http.delete<RetData>(apiURL, {
      headers: this.header,
      body: JSON.stringify(meisterschaft),
    });
  }

  getClubmeister(jahr: number): Observable<RetData> {
    const apiURL = this.backendApiUrl + '/clubmeister/byjahr?jahr=' + jahr;
    return this.http.get<RetData>(apiURL, { headers: this.header });
  }

  refreshClubmeister(jahr: number): Observable<RetData> {
    const apiURL = this.backendApiUrl + '/clubmeister/calcmeister?jahr=' + jahr;
    return this.http.get<RetData>(apiURL, { headers: this.header });
  }

  getKegelmeister(jahr: number): Observable<RetData> {
    const apiURL = this.backendApiUrl + '/kegelmeister/byjahr?jahr=' + jahr;
    return this.http.get<RetData>(apiURL, { headers: this.header });
  }

  refreshKegelmeister(jahr: number): Observable<RetData> {
    const apiURL =
      this.backendApiUrl + '/kegelmeister/calcmeister?jahr=' + jahr;
    return this.http.get<RetData>(apiURL, { headers: this.header });
  }

  getChartData(jahr: number): Observable<RetData> {
    const apiURL =
      this.backendApiUrl + '/meisterschaft/getchartdata?jahr=' + jahr;
    return this.http.get<RetData>(apiURL, { headers: this.header });
  }

  getFiscalyear(): Observable<RetData> {
    const apiURL = this.backendApiUrl + '/fiscalyear';
    return this.http.get<RetData>(apiURL, { headers: this.header });
  }

  addFiscalyear(data: Fiscalyear): Observable<RetData> {
    const apiURL = this.backendApiUrl + '/fiscalyear';
    const body = JSON.stringify(data);
    return this.http.post<RetData>(apiURL, body, { headers: this.header });
  }

  updFiscalyear(data: Fiscalyear): Observable<RetData> {
    const apiURL = this.backendApiUrl + '/fiscalyear/' + data.id;
    const body = JSON.stringify(data);
    return this.http.patch<RetData>(apiURL, body, { headers: this.header });
  }
  delFiscalyear(data: Fiscalyear): Observable<RetData> {
    const apiURL = this.backendApiUrl + '/fiscalyear/' + data.id;
    const body = JSON.stringify(data);
    return this.http.delete<RetData>(apiURL, {
      headers: this.header,
      body: body,
    });
  }
  getOneFiscalyear(year: string): Observable<RetData> {
    const apiURL = this.backendApiUrl + '/fiscalyear/getbyyear?year=' + year;
    return this.http.get<RetData>(apiURL, { headers: this.header });
  }
  closeFiscalyear(jahr: string, status: number): Observable<RetData> {
    const apiURL =
      this.backendApiUrl +
      '/fiscalyear/closeyear?year=' +
      jahr +
      '&state=' +
      status;
    return this.http.get<RetData>(apiURL, { headers: this.header });
  }

  getOneAccount(jahr: number, accountid: number): Observable<RetData> {
    const apiURL =
      this.backendApiUrl +
      '/journal/getaccdata?year=' +
      jahr +
      '&account=' +
      accountid;
    return this.http.get<RetData>(apiURL, { headers: this.header });
  }
  getAccount(): Observable<RetData> {
    const apiURL = this.backendApiUrl + '/account';
    return this.http.get<RetData>(apiURL, { headers: this.header });
  }
  addAccount(data: Account): Observable<RetData> {
    const apiURL = this.backendApiUrl + '/account';
    const body = JSON.stringify(data);
    return this.http.post<RetData>(apiURL, body, { headers: this.header });
  }
  updAccount(data: Account): Observable<RetData> {
    const apiURL = this.backendApiUrl + '/account/' + data.id;
    const body = JSON.stringify(data);
    return this.http.patch<RetData>(apiURL, body, { headers: this.header });
  }
  delAccount(data: Account): Observable<RetData> {
    const apiURL = this.backendApiUrl + '/account/' + data.id;
    const body = JSON.stringify(data);
    return this.http.delete<RetData>(apiURL, {
      headers: this.header,
      body: body,
    });
  }
  getOneDataByOrder(order: number): Observable<RetData> {
    const apiURL =
      this.backendApiUrl + '/account/getonedatabyorder?order=' + order;
    return this.http.get<RetData>(apiURL, { headers: this.header });
  }
  getAmountOneAcc(datum: string, order: number): Observable<RetData> {
    const apiURL =
      this.backendApiUrl +
      '/account/getamountoneacc?date=' +
      datum +
      '&order=' +
      order;
    return this.http.get<RetData>(apiURL, { headers: this.header });
  }
  getJournal(jahr: number): Observable<RetData> {
    const apiURL = this.backendApiUrl + '/journal/getbyyear?year=' + jahr;
    return this.http.get<RetData>(apiURL, { headers: this.header });
  }
  addJournal(data: Journal): Observable<RetData> {
    const apiURL = this.backendApiUrl + '/journal';
    const body = JSON.stringify(data);
    return this.http.post<RetData>(apiURL, body, { headers: this.header });
  }
  updJournal(data: Journal): Observable<RetData> {
    const apiURL = this.backendApiUrl + '/journal/' + data.id;
    const body = JSON.stringify(data);
    return this.http.patch<RetData>(apiURL, body, { headers: this.header });
  }
  delJournal(data: Journal): Observable<RetData> {
    const apiURL = this.backendApiUrl + '/journal/' + data.id;
    const body = JSON.stringify(data);
    return this.http.delete<RetData>(apiURL, {
      headers: this.header,
      body: body,
    });
  }
  getKegelkasse(monat: number, jahr: number): Observable<RetData> {
    const apiURL =
      this.backendApiUrl +
      '/kegelkasse/kassebydatum?monat=' +
      monat +
      '&jahr=' +
      jahr;
    return this.http.get<RetData>(apiURL, { headers: this.header });
  }
  getAllKegelkasse(jahr: number): Observable<RetData> {
    const apiURL = this.backendApiUrl + '/kegelkasse/kassebyjahr?jahr=' + jahr;
    return this.http.get<RetData>(apiURL, { headers: this.header });
  }
  addKegelkasse(data: Kegelkasse): Observable<RetData> {
    const apiURL = this.backendApiUrl + '/kegelkasse';
    const body = JSON.stringify(data);
    return this.http.post<RetData>(apiURL, body, { headers: this.header });
  }
  updKegelkasse(data: Kegelkasse): Observable<RetData> {
    const apiURL = this.backendApiUrl + '/kegelkasse/' + data.id;
    const body = JSON.stringify(data);
    return this.http.patch<RetData>(apiURL, body, { headers: this.header });
  }

  createReceipt(id: number): Observable<RetDataFile> {
    const apiURL =
      this.backendApiUrl + '/kegelkasse/genreceipt?kegelkasseId=' + id;
    return this.http.get<RetDataFile>(apiURL, { headers: this.header });
  }

  getOneJournal(id: number): Observable<RetData> {
    const apiURL = this.backendApiUrl + '/journal/' + id;
    return this.http.get<RetData>(apiURL, { headers: this.header });
  }
  exportJournal(jahr: number, receipt: number): Observable<RetDataFile> {
    const apiURL =
      this.backendApiUrl +
      '/journal/write?year=' +
      jahr +
      '&receipt=' +
      receipt;
    return this.http.get<RetDataFile>(apiURL, { headers: this.header });
  }
  getAttachment(id: number): Observable<RetData> {
    const apiURL = this.backendApiUrl + '/receipt/findatt?journalid=' + id;
    return this.http.get<RetData>(apiURL, { headers: this.header });
  }
  getAllAttachment(jahr: number, journalid?: number): Observable<RetData> {
    const params = new URLSearchParams();
    params.append('jahr', jahr.toString());
    if (journalid) params.append('journalid', journalid.toString());
    const apiURL =
      this.backendApiUrl + '/receipt/findallatt?' + params.toString();
    return this.http.get<RetData>(apiURL, { headers: this.header });
  }

  uploadAtt(reciept: string, year: string): Observable<Blob> {
    const params = new URLSearchParams();
    params.append('filename', reciept);
    params.append('year', year);
    const apiURL =
      this.backendApiUrl + '/receipt/uploadatt?' + params.toString();
    return this.http.get(apiURL, {
      headers: this.header,
      responseType: 'blob',
    });
  }

  delAtt(journalid: number, receipt: Receipt): Observable<RetData> {
    const apiURL = this.backendApiUrl + '/receipt/' + receipt.id;
    return this.http.delete<RetData>(apiURL, { headers: this.header });
  }

  addReceipt(jahr: string, files: string): Observable<RetDataFiles> {
    const apiURL = this.backendApiUrl + '/receipt';
    const body = { jahr: jahr, uploadFiles: files };
    return this.http.post<RetDataFiles>(apiURL, JSON.stringify(body), {
      headers: this.header,
    });
  }

  updReceipt(receipt: Receipt): Observable<RetData> {
    const apiURL = this.backendApiUrl + '/receipt/' + receipt.id;
    const body = receipt;
    return this.http.patch<RetData>(apiURL, JSON.stringify(body), {
      headers: this.header,
    });
  }

  delReceipt(receipt: Receipt): Observable<RetData> {
    const apiURL = this.backendApiUrl + '/receipt/' + receipt.id;
    return this.http.delete<RetData>(apiURL, { headers: this.header });
  }

  bulkAddReceipt(
    jahr: string,
    journalid: number,
    files: string,
  ): Observable<RetDataFiles> {
    const apiURL = this.backendApiUrl + '/receipt/att2journal';
    const body: { uploadfiles: string; year: string; journalId: number } = {
      uploadfiles: files,
      year: jahr,
      journalId: journalid,
    };
    return this.http.post<RetDataFiles>(apiURL, JSON.stringify(body), {
      headers: this.header,
    });
  }

  addAtt(journalid: number, receipt: Receipt[]): Observable<RetData> {
    const apiURL =
      this.backendApiUrl +
      '/journal-receipt/add2journal?journalid=' +
      journalid;
    const body = JSON.stringify(receipt);
    return this.http.post<RetData>(apiURL, body, { headers: this.header });
  }

  getBudget(jahr: number): Observable<RetData> {
    const apiURL = this.backendApiUrl + '/budget?year=' + jahr;
    return this.http.get<RetData>(apiURL, { headers: this.header });
  }
  addBudget(data: Budget): Observable<RetData> {
    const apiURL = this.backendApiUrl + '/budget';
    const body = JSON.stringify(data);
    return this.http.post<RetData>(apiURL, body, { headers: this.header });
  }
  updBudget(data: Budget): Observable<RetData> {
    const apiURL = this.backendApiUrl + '/budget/' + data.id;
    const body = JSON.stringify(data);
    return this.http.patch<RetData>(apiURL, body, { headers: this.header });
  }
  delBudget(data: Budget): Observable<RetData> {
    const apiURL = this.backendApiUrl + '/budget/' + data.id;
    return this.http.delete<RetData>(apiURL, { headers: this.header });
  }
  copyBudget(yearFrom: number, yearTo: number): Observable<RetData> {
    const apiURL =
      this.backendApiUrl +
      '/budget/copyyear?from=' +
      yearFrom +
      '&to=' +
      yearTo;
    return this.http.put<RetData>(apiURL, { headers: this.header });
  }

  showAccData(jahr: number): Observable<RetData> {
    const apiURL =
      this.backendApiUrl + '/account/getaccountsummary?jahr=' + jahr;
    return this.http.get<RetData>(apiURL, { headers: this.header });
  }

  exportAccData(jahr: number): Observable<RetDataFile> {
    const apiURL = this.backendApiUrl + '/fiscalyear/writebilanz?year=' + jahr;
    return this.http.get<RetDataFile>(apiURL, { headers: this.header });
  }
  exportAccountData(jahr: number): Observable<RetDataFile> {
    const apiURL =
      this.backendApiUrl +
      '/account/writekontoauszug?year=' +
      jahr +
      '&all=false';
    return this.http.get<RetDataFile>(apiURL, { headers: this.header });
  }

  // ---------------------------------------------------------------------
  // Homepage: News, Berichte, Anmeldungen, Jahr-Freigabe
  // ---------------------------------------------------------------------

  getNewsData(): Observable<RetData> {
    const apiURL = this.backendApiUrl + '/news';
    return this.http.get<RetData>(apiURL, { headers: this.header });
  }

  addNewsData(news: HomepageNews): Observable<RetData> {
    const apiURL = this.backendApiUrl + '/news';
    return this.http.post<RetData>(apiURL, JSON.stringify(news), {
      headers: this.header,
    });
  }

  updNewsData(news: HomepageNews): Observable<RetData> {
    const apiURL = this.backendApiUrl + '/news/' + news.id;
    return this.http.patch<RetData>(apiURL, JSON.stringify(news), {
      headers: this.header,
    });
  }

  delNewsData(news: HomepageNews): Observable<RetData> {
    const apiURL = this.backendApiUrl + '/news/' + news.id;
    return this.http.delete<RetData>(apiURL, { headers: this.header });
  }

  getBerichteData(): Observable<RetData> {
    const apiURL = this.backendApiUrl + '/berichte';
    return this.http.get<RetData>(apiURL, { headers: this.header });
  }

  addBerichtData(bericht: HomepageBericht): Observable<RetData> {
    const apiURL = this.backendApiUrl + '/berichte';
    return this.http.post<RetData>(apiURL, JSON.stringify(bericht), {
      headers: this.header,
    });
  }

  updBerichtData(bericht: HomepageBericht): Observable<RetData> {
    const apiURL = this.backendApiUrl + '/berichte/' + bericht.id;
    return this.http.patch<RetData>(apiURL, JSON.stringify(bericht), {
      headers: this.header,
    });
  }

  delBerichtData(bericht: HomepageBericht): Observable<RetData> {
    const apiURL = this.backendApiUrl + '/berichte/' + bericht.id;
    return this.http.delete<RetData>(apiURL, { headers: this.header });
  }

  getAnmeldungen(anlassid?: number): Observable<RetData> {
    let apiURL = this.backendApiUrl + '/anmeldungen';
    if (anlassid) apiURL += '?anlassid=' + anlassid;
    return this.http.get<RetData>(apiURL, { headers: this.header });
  }

  updAnmeldung(anmeldung: AnlassAnmeldung): Observable<RetData> {
    const apiURL = this.backendApiUrl + '/anmeldungen/' + anmeldung.id;
    const body = JSON.stringify({
      status: anmeldung.status,
      bemerkung: anmeldung.bemerkung,
    });
    return this.http.patch<RetData>(apiURL, body, { headers: this.header });
  }

  delAnmeldung(anmeldung: AnlassAnmeldung): Observable<RetData> {
    const apiURL = this.backendApiUrl + '/anmeldungen/' + anmeldung.id;
    return this.http.delete<RetData>(apiURL, { headers: this.header });
  }

  getJahrFreigaben(): Observable<RetData> {
    const apiURL = this.backendApiUrl + '/jahrfreigabe';
    return this.http.get<RetData>(apiURL, { headers: this.header });
  }

  upsertJahrFreigabe(freigabe: JahrFreigabe): Observable<RetData> {
    const apiURL = this.backendApiUrl + '/jahrfreigabe';
    const body = JSON.stringify({
      jahr: freigabe.jahr,
      clubmeister: freigabe.clubmeister,
      kegelmeister: freigabe.kegelmeister,
    });
    return this.http.put<RetData>(apiURL, body, { headers: this.header });
  }
}
