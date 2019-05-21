import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { switchMap, debounceTime } from 'rxjs/operators';

import { routerTransition } from '../../../router.animations';
import { CommonService } from '../../../shared/services/common.service';

import { PublisherService } from '../../../shared/services/publisher.service';

@Component({
    selector: 'app-add',
    templateUrl: './add.component.html',
    styleUrls: ['./buyers.component.scss'],
    animations: [routerTransition()]
})
export class AddComponent implements OnInit {
    formdata;
    error: boolean = false;
    password_error: boolean = false;
    isLoading: boolean = false;
    filteredPublishers: Observable<any>;
    loggedUser: any;
    loggedUserSettings: any;
    constructor(
        public router: Router,
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
                Validators.compose([
                    Validators.required,
                    Validators.minLength(8)
                ])
            ),
            cnf_passwd: new FormControl(
                '',
                Validators.compose([Validators.required])
            ),
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
            buffer_time: new FormControl('', Validators.required)
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
    addBuyer() {
        this.error = false;
        this.password_error = false;
        if (this.formdata.invalid) {
            this.error = true;
        } else {
            let data = this.formdata.value;

            if (data.passwd !== data.cnf_passwd) {
                this.password_error = true;
            } else {
                data.password = data.passwd;

                if (this.loggedUser.role === 'publisher') {
                    data.pub_id = this.loggedUser.uid;
                } else {
                    data.pub_id = data.pub_id.uid;
                }

                delete data.passwd;
                delete data.cnf_passwd;

                this.myservice.post('/buyer/', data).subscribe(
                    res => {
                        if (res.buyer) {
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
