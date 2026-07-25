 
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, timer } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '@environments/environment';
import { User } from '@app/models';
import { RetData } from './backend.service';
import { LayoutService } from './app.layout.service';

export interface RetDataUser extends RetData {
  cookie: { accessToken: string; refreshToken: string };
}

@Injectable({ providedIn: 'root' })
export class AccountService {
  private router = inject(Router);
  private http = inject(HttpClient);
  private layoutService = inject(LayoutService);

  private _userSubject: BehaviorSubject<User> = new BehaviorSubject(new User());
  public get userSubject(): BehaviorSubject<User> {
    return this._userSubject;
  }
  private apiUrl: string;
  private header!: HttpHeaders;

  constructor() {
    this.header = new HttpHeaders({
      'Access-Control-Allow-Origin': environment.apiUrlSelf,
      'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      'Access-Control-Allow-Headers':
        'Access-Control-Allow-Headers,Access-Control-Allow-Methods,Access-Control-Allow-Origin, Origin, X-Requested-With, Content-Type, Accept, Authorization',
      'Content-Type': 'application/json',
    });
    this.apiUrl = environment.apiUrl;
    const user = sessionStorage.getItem('user');
    if (user) {
      this._userSubject.next(JSON.parse(user));
    }
    timer(0, 1 * 60000).subscribe({
      next: () => this.refresh(),
    });
  }

  public get userValue(): User {
    return this._userSubject.value;
  }

  isLogged(): boolean {
    return this._userSubject && this.userValue.id > 0;
  }

  login(email: string, password: string) {
    return this.http
      .post<RetDataUser>(`${this.apiUrl}/auth/login`, { email, password })
      .pipe(
        map((retData) => {
          this.saveUser(retData.data as User, retData.cookie);
          return this.userValue;
        }),
      );
  }

  async refresh() {
    if (this.isLogged()) {
      const mins =
        (new Date().getTime() - this.layoutService.userActiveSince.getTime()) /
        1000 /
        60;
      if (mins > 30 && mins < 60) {
        this.http
          .get<RetDataUser>(`${this.apiUrl}/auth/refreshToken`, {
            headers: this.header,
          })
          .subscribe({
            next: (retData) => {
              this.saveUser(retData.data as User, retData.cookie);
              return this.userValue;
            },
          });
      } else if (mins > 60) {
        await this.logout();
      }
    }
  }

  private saveUser(user: User, cookie: { accessToken: string }) {
    user.token = cookie.accessToken;
    // store user details and jwt token in session storage to keep user logged in between page refreshes
    sessionStorage.setItem('user', JSON.stringify(user));
    this._userSubject.next(user);
    this.layoutService.userActiveSince = new Date();
  }

  async logout() {
    // remove user from session storage and set current user to null
    sessionStorage.removeItem('user');
    this._userSubject?.next(new User());
    await this.router.navigate(['/']);
  }

  register(user: User) {
    const body = JSON.stringify(user);
    return this.http.post<RetData>(`${this.apiUrl}/user`, body, {
      headers: this.header,
    });
  }

  getAll() {
    return this.http.get<RetData>(`${this.apiUrl}/user`, {
      headers: this.header,
    });
  }

  getById(id: number) {
    return this.http.get<RetData>(`${this.apiUrl}/user/${id}`, {
      headers: this.header,
    });
  }

  update(id: number, params: Partial<User>) {
    return this.http
      .patch(`${this.apiUrl}/user/${id}`, params, { headers: this.header })
      .pipe(
        map((x) => {
          // update stored user if the logged in user updated their own record
          if (id == this.userValue.id) {
            // update session storage
            const user = { ...this.userValue, ...params };
            sessionStorage.setItem('user', JSON.stringify(user));

            // publish updated user to subscribers
            this._userSubject?.next(user);
          }
          return x;
        }),
      );
  }

  newPasswort(email: string) {
    return this.http
      .get(`${this.apiUrl}/user/newpass/${email}`, { headers: this.header })
      .pipe(
        map((x) => {
          // auto logout if the logged in user deleted their own record
          if (email == this.userValue.email) {
            this.logout();
          }
          return x;
        }),
      );
  }

  delete(id: number) {
    return this.http
      .delete(`${this.apiUrl}/user/${id}`, { headers: this.header })
      .pipe(
        map((x) => {
          // auto logout if the logged in user deleted their own record
          if (id == this.userValue.id) {
            this.logout();
          }
          return x;
        }),
      );
  }
}
