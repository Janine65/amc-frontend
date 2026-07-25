import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { LayoutService } from "../service/app.layout.service";
import { Package } from '@model/user';
import pkg from './../../../package.json';
import { AccountService } from '@service/account.service';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { BackendService } from '@service/backend.service';

@Component({
    selector: 'app-footer',
    templateUrl: './app.footer.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RouterLink]
})
export class AppFooterComponent implements OnInit {
    layoutService = inject(LayoutService);
    private accountService = inject(AccountService);
    private backendService = inject(BackendService);

    readonly appVersion = signal('');

    async ngOnInit() {
        let appVersion = '';
        console.debug('AppFooterComponent ngOnInit');
        let pkgFrontString = sessionStorage.getItem('aboutFrontend');
        let pkgFront: Package = {}, pkgBack: Package = {};
        if (!pkgFrontString) {
            pkgFrontString = JSON.stringify(pkg);
            sessionStorage.setItem('aboutFrontend', pkgFrontString);
        }
        pkgFront = JSON.parse(pkgFrontString);
        appVersion = pkgFront.version ?? '';
        let pkgBackString = sessionStorage.getItem('aboutBackend');
        if (!pkgBackString) {
            const about = await firstValueFrom(this.backendService.getAbout());
            console.debug('AppFooterComponent - getAbout', about);
            pkgBackString = JSON.stringify(about);
            sessionStorage.setItem('aboutBackend', pkgBackString);
        }
        pkgBack = JSON.parse(pkgBackString);
        appVersion += ' / ' + (pkgBack.version ?? '');
        this.appVersion.set(appVersion);
    }
    public isLoggedIn(): boolean {
        if (this.accountService.userValue.id) {
            return true;
        }
        return false;

    }
    public getLoggedinUser() {
        if (this.isLoggedIn())
            return this.accountService.userValue.name;

        return 'not logged in';
    }}
