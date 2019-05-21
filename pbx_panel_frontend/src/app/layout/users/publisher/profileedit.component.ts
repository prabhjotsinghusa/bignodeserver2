import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { routerTransition } from '../../../router.animations';
import { CommonService } from '../../../shared/services/common.service';

@Component({
    selector: 'app-profileedit',
    templateUrl: './profileedit.component.html',
    styleUrls: ['./publisher.component.scss'],
    animations: [routerTransition()]
})
export class ProfileeditComponent implements OnInit {
    loggedUser;
    loggedUserSettings;
    constructor(public router: Router, private myservice: CommonService) {
        this.loggedUser = JSON.parse(localStorage.getItem('user'));
    }
    formdata;
    error = false;
    ngOnInit() {
        this.formdata = new FormGroup({
            fullname: new FormControl(this.loggedUser.fullname, Validators.compose([
                Validators.required,
                Validators.minLength(1),
            ])),
            username: new FormControl({ value: this.loggedUser.username, disabled: true }),
            email: new FormControl(this.loggedUser.email, Validators.compose([
                Validators.required,
                Validators.minLength(1),
                Validators.email
            ])),
            contact: new FormControl(this.loggedUser.contact, Validators.compose([
                Validators.required,
                Validators.minLength(10),
                Validators.maxLength(10),
            ])),

        });
    }
    saveProfile() {
        this.error = false;
        if (this.formdata.invalid) {
            this.error = true;
        } else {
            const data = this.formdata.value;

            this.myservice.put('/user/updateProfile/' + this.loggedUser.uid, data)
                .subscribe(
                    result => {
                        if (result.user) {
                            delete result.user.password;
                            localStorage.setItem('user', JSON.stringify(result.user));
                            this.router.navigate(['/users/profile']);
                        }
                    },
                    err => {
                        console.log(err, 'error');
                    }
                );

        }

    }
}
