import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient, HttpParams } from '@angular/common/http';
import { Router, NavigationEnd } from '@angular/router';
import { Observable } from 'rxjs';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RealtimeService {

  constructor(private http: HttpClient) { }

  private formatErrors(error: any) {
    return throwError(error.error);
  }

  get(path: string): Observable<any> {
    return this.http.get(`${path}`)
      .pipe(catchError(this.formatErrors));
  }

  post(path: string, body: Object = {}): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' });
    return this.http.post(`${path}`, JSON.stringify(body),
      { headers: headers })
      .pipe(catchError(this.formatErrors));
  }

  get2(path: string): Observable<any> {
    const headers = new HttpHeaders({ 'authorization': 'manish' });
    return this.http.get(`${path}`, {  withCredentials: true, headers: headers })
      .pipe(catchError(this.formatErrors));
  }

}
