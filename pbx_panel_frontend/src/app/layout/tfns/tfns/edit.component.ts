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
    styleUrls: ['./tfns.component.scss'],
    animations: [routerTransition()]
})
export class EditComponent implements OnInit {
    constructor(public router: Router, private activeroute: ActivatedRoute, private myservice: CommonService,
        private publisherservice: PublisherService) { }
    formdata;
    error = false;
    password_error = false;
    success_msg = false;
    edit_tfn_id = 0;
    edit_pub_id = 0;
    isLoading = false;
    filteredPublishers: Observable<any>;
    ngOnInit() {
        this.formdata = new FormGroup({
            pub_id: new FormControl('', Validators.required),
            tfn: new FormControl({ value: '', disabled: true }),
            price_per_tfn: new FormControl({ value: '', disabled: true }),
            charge_per_minute: new FormControl('', Validators.required),
            status: new FormControl('')
        });

        this.filteredPublishers = this.formdata.get('pub_id').valueChanges.pipe(
            debounceTime(200),
            switchMap(value => this.publisherservice.search(value))
        );

        /* get url variables */
        this.activeroute.params.subscribe(params => {
            this.edit_tfn_id = params.tfn_id;
        });

        this.myservice.get('/getTfnById/' + this.edit_tfn_id).subscribe(
            data => {
                const tfn = data.tfn[0];
                this.edit_pub_id = tfn.pub_id;
                this.formdata.patchValue({
                    pub_id: tfn.pub_id,
                    tfn: tfn.tfn,
                    price_per_tfn: tfn.price_per_tfn,
                    charge_per_minute: tfn.charge_per_minute,
                    status: tfn.status
                });
                if (this.edit_pub_id > 0) {
                    /* getting the publisher name and id */
                    this.myservice.get('/publisher/getPublishers/' + this.edit_pub_id).subscribe(
                        data => {
                            const user = data.user;
                            this.formdata.patchValue({
                                pub_id: { uid: user.uid, fullname: user.fullname },
                            });

                        }, err => {
                            console.log(err);
                        }
                    );
                }

            }, err => {
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
        if (publisher) { return publisher.fullname; }
    }
    editTFN() {
        this.error = false;
        this.password_error = false;
        if (this.formdata.invalid) {
            this.error = true;
        } else {
            const data = this.formdata.value;

            if (!(data.pub_id > 0)) {
                if (data.pub_id.uid !== undefined) {
                    data.pub_id = data.pub_id.uid;
                }
            }

            //data.status = 'unused';
            this.myservice.put('/updatePublisher/' + this.edit_tfn_id, data)
                .subscribe(
                    data => {
                        if (data.tfn) {
                            this.router.navigate(['/tfns']);
                        }
                    },
                    err => {
                        console.log(err, 'error');
                    }
                );

        }
    }

}
