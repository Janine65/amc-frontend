import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppLayoutComponent } from "./layout/app.layout.component";
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AdressenComponent } from './components/verwaltung/adressen/adressen.component';
import { ParameterComponent } from './components/verwaltung/parameter/parameter.component';
import { AnlaesseComponent } from './components/verwaltung/anlaesse/anlaesse.component';
import { AuthGuard } from './service';
import { ListComponent } from './components/users/list/list.component';
import { LoginComponent } from './components/account/login/login.component';
import { ProfileComponent } from './components/account/profile/profile.component';
import { MeisterschaftComponent } from './components/auswertung/meisterschaft/meisterschaft.component';
import { AuswertungComponent } from './components/auswertung/auswertung/auswertung.component';
import { JournalComponent } from './components/buchhaltung/journal/journal.component';
import { KontenComponent } from './components/buchhaltung/konten/konten.component';
import { GeschaeftsjahrComponent } from './components/buchhaltung/geschaeftsjahr/geschaeftsjahr.component';
import { KtoAuswertungComponent } from './components/buchhaltung/kto-auswertung/kto-auswertung.component';
import { BudgetComponent } from './components/buchhaltung/budget/budget.component';
import { KegelkasseComponent } from './components/buchhaltung/kegelkasse/kegelkasse.component';
import { AppAboutComponent } from './layout/app.about.component';
import { HomepageNewsComponent } from './components/homepage/news/news.component';
import { HomepageBerichteComponent } from './components/homepage/berichte/berichte.component';
import { HomepageAnmeldungenComponent } from './components/homepage/anmeldungen/anmeldungen.component';
import { HomepageFreigabeComponent } from './components/homepage/freigabe/freigabe.component';

@NgModule({
  imports: [RouterModule.forRoot([
    {
      path: '', component: AppLayoutComponent,
      children: [
        { path: '', component: DashboardComponent },
        { path: 'about', component: AppAboutComponent },
        { path: 'verwaltung/adressen', component: AdressenComponent, canActivate: [AuthGuard], data: { role: 'user' } },
        { path: 'verwaltung/anlaesse', component: AnlaesseComponent, canActivate: [AuthGuard], data: { role: 'user' } },
        { path: 'verwaltung/parameter', component: ParameterComponent, canActivate: [AuthGuard], data: { role: 'admin' } },
        { path: 'users', component: ListComponent, canActivate: [AuthGuard], data: { role: 'admin' } },
        {
          path: 'account',
          children: [
            { path: 'login', component: LoginComponent },
            { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard], data: { withRole: false, withPwd: true, user: undefined } }
          ]
        },
        { path: 'auswertung/meisterschaft', component: MeisterschaftComponent, canActivate: [AuthGuard], data: { role: 'user' } },
        { path: 'auswertung/auswertung', component: AuswertungComponent, canActivate: [AuthGuard], data: { role: 'user' } },
        {
          path: 'homepage',
          children: [
            { path: 'news', component: HomepageNewsComponent, canActivate: [AuthGuard], data: { role: 'user' } },
            { path: 'berichte', component: HomepageBerichteComponent, canActivate: [AuthGuard], data: { role: 'user' } },
            { path: 'anmeldungen', component: HomepageAnmeldungenComponent, canActivate: [AuthGuard], data: { role: 'user' } },
            { path: 'freigabe', component: HomepageFreigabeComponent, canActivate: [AuthGuard], data: { role: 'admin' } },
          ]
        },
        {
          path: 'buchhaltung',
          children: [
            { path: 'journal', component: JournalComponent, canActivate: [AuthGuard], data: { role: 'revisor' } },
            { path: 'kegelkasse', component: KegelkasseComponent, canActivate: [AuthGuard], data: {role: 'user'}},
            { path: 'konten', component: KontenComponent, canActivate: [AuthGuard], data: { role: 'admin' } },
            { path: 'geschaeftsjahr', component: GeschaeftsjahrComponent, canActivate: [AuthGuard], data: { role: 'admin' } },
            { path: 'budget', component: BudgetComponent, canActivate: [AuthGuard], data: { role: 'admin' } },
            { path: 'kto-auswertung', component: KtoAuswertungComponent, canActivate: [AuthGuard], data: { role: 'revisor' } },
          ]
        },
      ]
    }
  ])],
  exports: [RouterModule]
})
export class AppRoutingModule { }
