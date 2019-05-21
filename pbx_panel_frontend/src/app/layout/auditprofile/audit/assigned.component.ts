import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatAutocompleteSelectedEvent, MatChipInputEvent } from '@angular/material';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { COMMA, ENTER } from '@angular/cdk/keycodes';

import { routerTransition } from '../../../router.animations';
import { CommonService } from '../../../shared/services/common.service';
import { PublisherService } from '../../../shared/services/publisher.service';

@Component({
    selector: 'app-assigned',
    templateUrl: './assigned.component.html',
    styleUrls: ['./audit.component.scss'],
    animations: [routerTransition()]
})
export class AssignedComponent implements OnInit {

    formdata;
    isLoading: boolean = true;
    error: boolean = false;
    password_error: boolean = false;
    success_msg: boolean = false;
    edit_user_id = 0;
    optionsArr = [{ key: 0, value: 'Disable' }, { key: 1, value: 'Enable' }];
    visible = true;
    selectable = true;
    removable = true;
    addOnBlur = false;
    separatorKeysCodes: number[] = [ENTER, COMMA];
    publishersCtrl = new FormControl('');
    filteredpublishers: Observable<any>;
    publishers: any[] = [];
    allPublishers: any[] = [];
    @ViewChild('pubInput') pubInput: ElementRef<HTMLInputElement>;

    constructor(public router: Router, private activeroute: ActivatedRoute, private myservice: CommonService, private publisherservice: PublisherService) {
        this.publisherservice.search('').subscribe(data => this.allPublishers = data.user);
        this.filteredpublishers = this.publishersCtrl.valueChanges.pipe(
            startWith(null),
            map((pub: string | null) => pub ? this._filter(pub) : this.allPublishers.slice()));
    }

    ngOnInit() {
        this.formdata = new FormGroup({
            enabled_record: new FormControl(0),
            display_cnum: new FormControl(0),
            publishersCtrl: new FormControl(''),

        });

        /* get url variables */
        this.activeroute.params.subscribe(params => {
            this.edit_user_id = params.uid;
        });

        this.myservice.get('/publisher/getAssignedPublisher/' + this.edit_user_id).subscribe(data => {
            this.publishers = data = data.user.map(data => {

                return { uid: data.pub_id, fullname: data.fullname };
            });
            this.isLoading = false;
            //console.log(data);
        });

        /* get publisher settings. */
        this.myservice.get('/publisher/getPublisherSettings/' + this.edit_user_id).subscribe(
            data => {
                /* fill form while updating the publisher */
                var settings = data.settings;
                this.formdata.patchValue({
                    enabled_record: settings.enabled_record,
                    display_cnum: settings.display_cnum,
                    display_wallet: settings.display_wallet,
                    phone_system: settings.phone_system,
                    call_reducer: settings.call_reducer,
                    enable_inside_route: settings.enable_inside_route,
                    enable_outside_route: settings.enable_outside_route,
                    daily_tfns: settings.daily_tfns,
                    monthly_tfns: settings.monthly_tfns,
                    buyer_limit: settings.buyer_limit,
                    usage_module: settings.usage_module,
                    number_to_ivr: settings.number_to_ivr,
                    show_buyer_no: settings.show_buyer_no,
                });
            }, err => {
                console.log(err);
            }
        );


    }
    remove(pub: any): void {
        const index = this.publishers.indexOf(pub);

        if (index >= 0) {
            this.publishers.splice(index, 1);
        }
    }

    selected(event: MatAutocompleteSelectedEvent): void {
        //console.log(this.publishers);
        var pub = event.option.value;
        var check = true;
        this.publishers.forEach(function (item, index) {
            if (item.uid == pub.uid) {
                check = false;
            }
        });
        if (check) {
            this.publishers.push(event.option.value);
            this.pubInput.nativeElement.value = '';
            this.publishersCtrl.setValue(null);

        }
    }

    private _filter(value: any): any[] {
        let filterValue = '';
        if (value.fullname == undefined) {
            filterValue = value.toLowerCase();
        } else {
            filterValue = value.fullname.toLowerCase();
        }
        /* console.log(filterValue); */
        return this.allPublishers.filter(pub => pub.fullname.toLowerCase().indexOf(filterValue) === 0);
    }


    saveAssignedPublishers() {
        this.success_msg = false;
        this.error = false;
        this.password_error = false;
        if (this.formdata.invalid) {
            this.error = true;
        } else {
            if (this.publishers.length <= 0) {
                this.error = true;
            } else {
                let data = this.formdata.value;

                data.display_wallet = 0;
                data.phone_system = 0;
                data.call_reducer = 0;
                data.enable_inside_route = 0;
                data.enable_outside_route = 0;
                data.daily_tfns = 0;
                data.monthly_tfns = 0;
                data.buyer_limit = 0;
                data.usage_module = 0;
                data.number_to_ivr = 0;
                data.show_buyer_no = 0;

                this.myservice.post('/publisher/settings/' + this.edit_user_id, data)
                    .subscribe(
                        data => {
                            if (data.settings) {
                                this.success_msg = true;
                                //this.router.navigate(['/users']);
                            }
                        },
                        err => {
                            console.log(err, 'error');
                        }
                    );


                var pubArr: any = [];
                this.publishers.forEach(function (item, index) {
                    pubArr.push(item.uid);
                });

                var d = {
                    pub_id: pubArr,
                    audit_profile_id: this.edit_user_id,
                }
               // console.log(d, this.edit_user_id);

                this.myservice.post('/assignPublisher', d)
                    .subscribe(
                        data => {
                            if (data.success == 'OK') {
                                this.router.navigate(['/auditprofile']);
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
