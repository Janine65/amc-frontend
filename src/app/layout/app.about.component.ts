import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Package } from '@model/user';
import { Bind } from 'primeng/bind';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primeng/tabs';
import { Ripple } from 'primeng/ripple';
import { KeyValuePipe } from '@angular/common';

@Component({
    selector: 'app-app.about',
    templateUrl: './app.about.component.html',
    styleUrls: ['./app.about.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [Bind, Tabs, TabList, Ripple, Tab, TabPanels, TabPanel, KeyValuePipe]
})
export class AppAboutComponent implements OnInit{
  pkgFrontend: Package = {}
  pkgBackend: Package = { }

  ngOnInit(): void {
    const pkgFrontString = sessionStorage.getItem('aboutFrontend');
    if (pkgFrontString) {
        this.pkgFrontend = JSON.parse(pkgFrontString);
    }
    const pkgBackString = sessionStorage.getItem('aboutBackend');
    if (pkgBackString) {
        this.pkgBackend = JSON.parse(pkgBackString);
    }
  }
}
