import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient, HttpParams } from '@angular/common/http';
import { Router, NavigationEnd } from '@angular/router';
import { Observable } from 'rxjs';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../config';


@Injectable({
  providedIn: 'root'
})
export class PublisherService {
  public login_token: String = '';
  constructor(private http: HttpClient, private router: Router) {
    this.login_token = localStorage.getItem('login_token');
  }

  private formatErrors(error: any) {

    if (error.status === 401) {
      // navigate /delete cookies or whatever
      console.log('handled error ' + error.status);
      // this.router.navigate(['/login']);
      localStorage.removeItem('isLoggedin');
      localStorage.removeItem('user');
      localStorage.removeItem('login_token');
      document.location.reload();
      // this.router.navigate(['/']);
      // return false;
      // if you've caught / handled the error, you don't want to rethrow it
      // unless you also want downstream consumers to have to handle it as well.

    }
    return throwError(error.error);
  }


  get(path: string): Observable<any> {

    if (this.login_token !== '') {
      const headers = new HttpHeaders({ 'authorization': 'Token ' + this.login_token });

      return this.http.get(`${environment.api_url}${path}`, { headers: headers })
        .pipe(catchError(this.formatErrors));
    } else {
      return this.http.get(`${environment.api_url}${path}`)
        .pipe(catchError(this.formatErrors));
    }

  }

  search(term): Observable<any> {
    if (this.login_token !== '') {
      const headers = new HttpHeaders({ 'authorization': 'Token ' + this.login_token });
      return this.http.get(`${environment.api_url}/publisher/getActivePublishers/`, { headers: headers })
        .pipe(
          tap((response) => {
            response.user = response.user
              .map(user => new Publisher(user.uid, user.fullname))
              // Not filtering in the server since in-memory-web-api has somewhat restricted api
              .filter(user => {
                if (user.fullname !== null) {
                  return user.fullname.includes(term) || user.fullname.toLowerCase().includes(term);
                }
              });
            return response;
          })
        );
    } else {
      return this.http.get(`${environment.api_url}/publisher/getActivePublishers/`).pipe(
        tap((response) => {
          response.user = response.user
            .map(user => new Publisher(user.uid, user.fullname))
            // Not filtering in the server since in-memory-web-api has somewhat restricted api
            .filter(user => {
              if (user.fullname !== null) {
                return user.fullname.includes(term) || user.fullname.toLowerCase().includes(term);
              }
            });
          return response;
        })
      );
    }
  }

}
export class Publisher {
  constructor(public uid: number, public fullname: string) { }
}