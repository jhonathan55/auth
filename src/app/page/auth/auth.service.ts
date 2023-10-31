import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { UserI, UserResponseI } from './user';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
//helper
import { JwtHelperService } from '@auth0/angular-jwt';

const helper = new JwtHelperService();
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly TOKEN = 'token';
  private _http = inject(HttpClient);
  private _router = inject(Router);
  private _url = environment.baseUrl;
  public loggedIn = new BehaviorSubject<boolean>(false);
  constructor() {
    this.checkToken();
   }
  get isLogged(): Observable<boolean> {
    return this.loggedIn.asObservable();
  }
  login(user: UserI) {
    return this._http.post<UserResponseI>(`${this._url}auth/login`, user).pipe(
      tap((res) => {
        console.log(res);
        this.loggedIn.next(true);
        this.saveToken(res);
      }),
    )
  }
  saveToken(user: UserResponseI) {
    const { message, ...rest } = user;
    localStorage.setItem(this.TOKEN, JSON.stringify(rest.token));
  }
  logout() {
    localStorage.removeItem(this.TOKEN);
    this.loggedIn.next(false);
    this._router.navigate(['/login']);
  }

  checkToken(): Observable<boolean> {
    const token = localStorage.getItem(this.TOKEN);
    if (!token || token === 'undefined' || token === null) {
      this.logout();
      return new Observable<boolean>(obs => {
        obs.next(false);
      })
    }
    const validToken=helper.decodeToken(token);
    if(!validToken){
      this.logout();
      return new Observable<boolean>(obs => {
        obs.next(false);
      })
    }
    const isExpired=helper.isTokenExpired(token);
    console.log(isExpired);
    if(isExpired){
      this.logout();
      return new Observable<boolean>(obs => {
        obs.next(false);
      })
    }
    this.loggedIn.next(true);
    return new Observable<boolean>(obs => {
      obs.next(true);
    })
  }

}
