import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FlashMessagesService } from 'angular2-flash-messages';

import { routerTransition } from '../../../router.animations';
import { CommonService } from '../../../shared/services/common.service';

@Component({
    selector: 'app-passwordedit',
    templateUrl: './passwordedit.component.html',
    styleUrls: ['./publisher.component.scss'],
    animations: [routerTransition()]
})
export class PasswordeditComponent implements OnInit {
    loggedUser: any;
    loggedUserSettings: any;
    password_error = false;
    constructor(public router: Router, private myservice: CommonService, private _flashMessagesService: FlashMessagesService) {
        this.loggedUser = JSON.parse(localStorage.getItem('user'));
    }
    formdata;
    error = false;

    ngOnInit() {
        this.formdata = new FormGroup({
            old_passwd: new FormControl('', Validators.compose([
                Validators.required,
                Validators.minLength(8),
            ])),
            passwd: new FormControl('', Validators.compose([
                Validators.required,
                Validators.minLength(8),
            ])),
            cnf_passwd: new FormControl('', Validators.compose([
                Validators.required,
            ])),
        });
    }
    save() {
        this.error = false;
        if (this.formdata.invalid) {
            this.error = true;
        } else {
            const data = this.formdata.value;
            if (data.passwd !== data.cnf_passwd) {
                this.password_error = true;
            } else {
                if (this.loggedUser.role === 'buyer') {
                    this.myservice.put('/buyer/updatePassword/' + this.loggedUser.buyer_id, data)
                    .subscribe(
                        result => {
                            if (result.success === 'OK') {
                                this._flashMessagesService.show('Password is changed successfully.',
                                    { cssClass: 'alert-success', timeout: 3000 });
                            } else {
                                this._flashMessagesService.show(result.message, { cssClass: 'alert-danger', timeout: 3000 });
                            }
                            this.formdata.reset();
                        },
                        err => {
                            console.log(err, 'error');
                        }
                    );
                 } else {
                    this.myservice.put('/user/updatePassword/' + this.loggedUser.uid, data)
                        .subscribe(
                            result => {
                                if (result.success === 'OK') {
                                    this._flashMessagesService.show('Password is changed successfully.',
                                        { cssClass: 'alert-success', timeout: 3000 });
                                } else {
                                    this._flashMessagesService.show(result.message, { cssClass: 'alert-danger', timeout: 3000 });
                                }
                                this.formdata.reset();
                            },
                            err => {
                                console.log(err, 'error');
                            }
                        );
                }
            }


        }

    }
}
