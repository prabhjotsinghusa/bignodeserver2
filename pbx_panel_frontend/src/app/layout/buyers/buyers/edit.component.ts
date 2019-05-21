import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { switchMap, debounceTime } from 'rxjs/operators';

import { routerTransition } from '../../../router.animations';
import { CommonService } from '../../../shared/services/common.service';
import { PublisherService } from '../../../shared/services/publisher.service';

@Component({
    selector: 'app-edit',
    templateUrl: './edit.component.html',
    styleUrls: ['./buyers.component.scss'],
    animations: [routerTransition()]
})
export class EditComponent implements OnInit {
    formdata;
    error: boolean = false;
    password_error: boolean = false;
    success_msg: boolean = false;
    edit_buyer_id = 0;
    edit_pub_id = 0;
    isLoading: boolean = false;
    statuses = [
        { name: 'active', value: 'Active' },
        { name: 'disable', value: 'Disable' }
    ];
    filteredPublishers: Observable<any>;
    loggedUser: any;
    loggedUserSettings: any;
    constructor(
        public router: Router,
        private activeroute: ActivatedRoute,
        private myservice: CommonService,
        private publisherservice: PublisherService
    ) {
        this.loggedUser = JSON.parse(localStorage.getItem('user'));
        this.loggedUserSettings = JSON.parse(
            localStorage.getItem('userSettings')
        );
    }

    ngOnInit() {
        this.formdata = new FormGroup({
            pub_id: new FormControl('', Validators.required),
            name: new FormControl(
                '',
                Validators.compose([
                    Validators.required,
                    Validators.minLength(1)
                ])
            ),
            email: new FormControl(
                '',
                Validators.compose([
                    Validators.required,
                    Validators.minLength(1),
                    Validators.email
                ])
            ),
            passwd: new FormControl(
                '',
                Validators.compose([Validators.minLength(8)])
            ),
            cnf_passwd: new FormControl(''),
            contact: new FormControl(
                '',
                Validators.compose([
                    Validators.required,
                    Validators.minLength(10),
                    Validators.maxLength(10)
                ])
            ),
            address: new FormControl(
                '',
                Validators.compose([
                    Validators.required,
                    Validators.minLength(4),
                    Validators.maxLength(200)
                ])
            ),
            price_per_call: new FormControl(
                '',
                Validators.compose([Validators.required])
            ),
            buffer_time: new FormControl('', Validators.required),
            status: new FormControl('active')
        });

        if (this.loggedUser.role === 'publisher') {
            this.formdata.patchValue({
                pub_id: this.loggedUser.uid
            });
        } else {
            this.filteredPublishers = this.formdata
                .get('pub_id')
                .valueChanges.pipe(
                    debounceTime(200),
                    switchMap(value => this.publisherservice.search(value))
                );
        }

        /* get url variables */
        this.activeroute.params.subscribe(params => {
            this.edit_buyer_id = params.buyer_id;
        });

        this.myservice.get('/buyer/getBuyer/' + this.edit_buyer_id).subscribe(
            data => {
                const buyer = data.buyer;
                this.edit_pub_id = buyer.pub_id;
                this.formdata.patchValue({
                    pub_id: buyer.pub_id,
                    name: buyer.name,
                    email: buyer.email,
                    contact: buyer.contact,
                    address: buyer.address,
                    price_per_call: buyer.price_per_call,
                    buffer_time: buyer.buffer_time,
                    status: buyer.status
                });
                /* getting the publisher name and id */
                this.myservice
                    .get('/publisher/getPublishers/' + this.edit_pub_id)
                    .subscribe(
                        data => {
                            const user = data.user;
                            this.formdata.patchValue({
                                pub_id: {
                                    uid: user.uid,
                                    fullname: user.fullname
                                }
                            });
                        },
                        err => {
                            console.log(err);
                        }
                    );
            },
            err => {
                console.log(err);
            }
        );
    }
    hideLoader() {
        this.isLoading = false;
    }
    showLoader() {
        this.isLoading = true;
    }
    displayFn(publisher) {
        if (publisher) {
            return publisher.fullname;
        }
    }
    editBuyer() {
        this.error = false;
        this.password_error = false;
        if (this.formdata.invalid) {
            this.error = true;
        } else {
            let data = this.formdata.value;

            if (data.passwd != data.cnf_passwd) {
                this.password_error = true;
            } else {
                data.password = data.passwd;
                // console.log(data, '------edit buyer');

                if (this.loggedUser.role === 'publisher') {
                    data.pub_id = this.loggedUser.uid;
                } else {
                    if (!(data.pub_id > 0)) {
                        data.pub_id = data.pub_id.uid;
                    }
                }

                delete data.passwd;
                delete data.cnf_passwd;

                this.myservice
                    .post('/buyer/editBuyer/' + this.edit_buyer_id, data)
                    .subscribe(
                        data => {
                            if (data.buyer) {
                                this.router.navigate(['/buyers']);
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
