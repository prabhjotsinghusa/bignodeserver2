import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { routerTransition } from '../router.animations';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { CommonService } from '../shared/services/common.service';
import { HttpClient } from '@angular/common/http';
@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    animations: [routerTransition()]
})
export class LoginComponent implements OnInit {
    ipAddress: any;
    constructor(public router: Router, private myservice: CommonService, private http: HttpClient) {
        window.localStorage.clear();
        this.http.get<{ ip: string }>('https://jsonip.com')
            .subscribe(data => {
                this.ipAddress = data.ip;
            });
    }

    ngOnInit() {
        const loggedIn = localStorage.getItem('isLoggedin');
        if (loggedIn == 'true') {
            this.router.navigate(['dashboard']);
        }
        this.formdata = new FormGroup({
            username: new FormControl('', Validators.compose([
                Validators.required,
                Validators.minLength(1),
            ])),
            password: new FormControl('', Validators.compose([
                Validators.required,
                Validators.minLength(1),
            ])),

        });
    }
    formdata;
    error: boolean = false;
    message = `nothing`;
    onLoggedin() {
        this.error = false;
        const formd = this.formdata.value;
        const ipaddr = ['103.43.155.130', '103.43.153.50'];
        if (formd.username !== '' && formd.password !== '') {
            this.myservice.post('/users/login/', formd)
                .subscribe(data => {
                    if (data.success === 'OK') {
                        delete data.user.password;
                        if (data.user.buyer_id !== undefined) {
                            data.user.role = 'buyer';
                            data.user.fullname = data.user.name;
                            localStorage.setItem('user', JSON.stringify(data.user));
                            localStorage.setItem('login_token', data.login_token);
                            localStorage.setItem('isLoggedin', 'true');
                            localStorage.setItem('userSettings', JSON.stringify({}));

                            /* array for buyer dashboard */
                            const buyerArr = [454];
                            if (buyerArr.indexOf(data.user.buyer_id) > -1) {
                                this.router.navigate(['buyerdashboard']);
                            } else {
                                if (data.user.buyer_id === 453) {
                                    this.loginHistory();
                                    this.router.navigate(['buyermonitoring/627/FR']);
                                } else if (data.user.buyer_id === 477) {
                                    if (ipaddr.indexOf(this.ipAddress) > -1) {
                                        this.loginHistory();
                                        this.router.navigate(['buyermonitoring/602/CHD']);
                                    } else {
                                        localStorage.removeItem('isLoggedin');
                                        localStorage.removeItem('user');
                                        localStorage.removeItem('login_token');
                                        localStorage.removeItem('userSettings');
                                        localStorage.removeItem('buyerNumbers');
                                        localStorage.removeItem('ip');
                                        this.router.navigate(['login']);
                                    }

                                } else {
                                    this.loginHistory();
                                    this.router.navigate(['cdr']);
                                }

                            }
                        } else {
                            localStorage.setItem('user', JSON.stringify(data.user));
                            localStorage.setItem('login_token', data.login_token);
                            localStorage.setItem('isLoggedin', 'true');
                            this.myservice.get('/publisher/getPublisherSettings/' + parseInt(data.user.uid)).subscribe(data2 => {
                                if (data2.settings) {
                                    localStorage.setItem('userSettings', JSON.stringify(data2.settings));
                                    if (data.user.role === 'director') {
                                        this.loginHistory();
                                        this.router.navigate(['/secondrealtime/commoncalls']);
                                    } else if (data.user.role === 'audit_profile') {
                                        if (ipaddr.indexOf(this.ipAddress) > -1) {
                                            this.loginHistory();
                                            this.router.navigate(['dashboard']);
                                        } else {
                                            localStorage.removeItem('isLoggedin');
                                            localStorage.removeItem('user');
                                            localStorage.removeItem('login_token');
                                            localStorage.removeItem('userSettings');
                                            localStorage.removeItem('ip');
                                            this.router.navigate(['login']);
                                        }
                                    } else {
                                        this.loginHistory();
                                        this.router.navigate(['dashboard']);
                                    }
                                }
                            }, err => {
                                console.log(err, 'login error');
                            });
                        }
                    }
                }, err => {
                    this.error = true;
                    if (err.success === 'NOK') {
                        if (formd.username === 'seowarusa41@pbx4you.com') {
                            this.message = `Your account is disabled. Please contact on telegram @vj001 to enable the account`;
                        } else {
                            this.message = `Either username or password is invalid.`;
                        }
                    } else {
                        this.message = `There is some errror in the request.`;
                        console.log(err, 'login error');
                    }
                }
                );
        } else {
            this.error = true;
            this.message = `Username or password is invalid.`;
        }
    }
    loginHistory() {
        // console.log( 'history data1');
        const loggedUser = JSON.parse(localStorage.getItem('user'));
        if (loggedUser.role !== 'admin') {
            const data = { user: loggedUser, url: '/login' };
            if (loggedUser.role === 'buyer') {
                data.user.fullname = data.user.name;
            }
            this.myservice.post('/userhistory/add', data).subscribe(res => {
                 // console.log(res, 'history data');
            });
        }
    }
}
