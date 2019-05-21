import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { routerTransition } from '../../../router.animations';
import { CommonService } from '../../../shared/services/common.service';

@Component({
    selector: 'app-add',
    templateUrl: './add.component.html',
    styleUrls: ['./publisher.component.scss'],
    animations: [routerTransition()]
})
export class AddComponent implements OnInit {
    constructor(public router: Router, private myservice: CommonService) { }
    formdata;
    error: boolean = false;
    password_error: boolean = false;
    ngOnInit() {
        this.formdata = new FormGroup({
            fullname: new FormControl('', Validators.compose([
                Validators.required,
                Validators.minLength(1),
            ])),
            email: new FormControl('', Validators.compose([
                Validators.required,
                Validators.minLength(1),
                Validators.email
            ])),
            passwd: new FormControl('', Validators.compose([
                Validators.required,
                Validators.minLength(8),
            ])),
            cnf_passwd: new FormControl('', Validators.compose([
                Validators.required,
            ])),
            contact: new FormControl('', Validators.compose([Validators.required, Validators.minLength(5), Validators.maxLength(10)])),
            price_per_tfn: new FormControl('', Validators.compose([
                Validators.required
            ])),
            pub_queue: new FormControl('travel'),
        });
    }
    addPublisher() {
        this.error = false;
        this.password_error = false;
        if (this.formdata.invalid) {
            this.error = true;
        } else {
            const data = this.formdata.value;
            data.role = 'publisher';
            if (data.passwd != data.cnf_passwd) {
                this.password_error = true;
            } else {
                data.password = data.passwd;
                delete data.passwd;
                delete data.cnf_passwd;

                this.myservice.post('/publisher/', data)
                    .subscribe(
                        data => {
                            if (data.user) {
                                this.router.navigate(['/users']);
                            }
                        },
                        err => {
                            console.log(err, 'error');
                        }
                    );
            }

        }

    }
}
