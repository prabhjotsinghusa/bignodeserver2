import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { routerTransition } from '../../../router.animations';
import { CommonService } from '../../../shared/services/common.service';

@Component({
    selector: 'app-buyer',
    templateUrl: './addbuyer.component.html',
    styleUrls: ['./publisher.component.scss'],
    animations: [routerTransition()]
})
export class AddbuyerComponent implements OnInit {
    constructor(public router: Router, private activeroute: ActivatedRoute, private myservice: CommonService) { }
    formdata;
    error: boolean = false;
    password_error: boolean = false;
    pub_id = 0;
    ngOnInit() {
        this.formdata = new FormGroup({
            name: new FormControl('', Validators.compose([
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
            contact: new FormControl('', Validators.compose([Validators.required, Validators.minLength(10), Validators.maxLength(10)])),
            address: new FormControl('', Validators.compose([Validators.required, Validators.minLength(4), Validators.maxLength(200)])),
            price_per_call: new FormControl('', Validators.compose([
                Validators.required,
            ])),
            buffer_time: new FormControl('', Validators.required),
        });
    }
    addBuyer() {
        this.error = false;
        this.password_error = false;

        this.activeroute.params.subscribe(params => {
            this.pub_id = params.uid;
            if (this.formdata.invalid) {
                this.error = true;
            } else {
                const data = this.formdata.value;

                if (data.passwd !== data.cnf_passwd) {
                    this.password_error = true;
                } else {
                    data.password = data.passwd;
                    data.pub_id = this.pub_id;
                    delete data.passwd;
                    delete data.cnf_passwd;

                    this.myservice.post('/buyer/', data)
                        .subscribe(
                            result => {
                                if (result.buyer) {
                                    this.router.navigate(['/users']);
                                }
                            },
                            err => {
                                console.log(err, 'error');
                            }
                        );
                }
            }



        });



    }
}
