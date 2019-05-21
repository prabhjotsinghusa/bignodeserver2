import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';


import { routerTransition } from '../../../router.animations';
import { CommonService } from '../../../shared/services/common.service';

@Component({
    selector: 'app-edit',
    templateUrl: './edit.component.html',
    styleUrls: ['./publisher.component.scss'],
    animations: [routerTransition()]
})
export class EditComponent implements OnInit {
    constructor(public router: Router, private activeroute: ActivatedRoute, private myservice: CommonService) { }
    formdata;
    formdata2;
    error: boolean = false;
    password_error: boolean = false;
    success_msg: boolean = false;
    edit_user_id = 0;
    pub_queues = [{ name: 'travel', value: 'Travel' }, { name: 'tech', value: 'Tech' }, { name: 'forwarding', value: 'Forwarding' }, { name: 'others', value: 'Others' }];
    statuses = [{ name: 'active', value: 'Active' }, { name: 'disable', value: 'Disable' }];
    optionsArr = [{ key: 0, value: 'Disable' }, { key: 1, value: 'Enable' }];
    oxygencallArr = [{ key: 0, value: 0 }, { key: 20, value: 5 }, { key: 10, value: 10 }, { key: 7, value: 15 }, { key: 5, value: 20 }, { key: 4, value: 25 }, { key: 3, value: 30 }, { key: 2, value: 50 }];
    ngOnInit() {
        this.formdata = new FormGroup({
            fullname: new FormControl('', Validators.compose([
                Validators.required,
                Validators.minLength(1),
            ])),
            username: new FormControl({ value: '', disabled: true }),
            email: new FormControl('', Validators.compose([
                Validators.required,
                Validators.minLength(1),
                Validators.email
            ])),
            passwd: new FormControl('', Validators.compose([
                Validators.minLength(8),
            ])),
            cnf_passwd: new FormControl(''),
            contact: new FormControl('', Validators.compose([
                Validators.required,
                Validators.minLength(10),
                Validators.maxLength(10),
            ])),
            price_per_tfn: new FormControl('', Validators.compose([
                Validators.required
            ])),
            pub_queue: new FormControl(''),
            status: new FormControl('active'),
        });
        this.formdata2 = new FormGroup({
            enabled_record: new FormControl(0),
            display_cnum: new FormControl(0),
            display_wallet: new FormControl(0),
            phone_system: new FormControl(0),
            call_reducer: new FormControl(0),
            enable_inside_route: new FormControl(0),
            enable_outside_route: new FormControl(0),
            daily_tfns: new FormControl(0),
            monthly_tfns: new FormControl(0),
            buyer_limit: new FormControl(0),
            usage_module: new FormControl(0),
            number_to_ivr: new FormControl(0),
            show_buyer_no: new FormControl(0),
            hide_campaign: new FormControl(0),
            charge_per_minute: new FormControl(0),
        });
        /* get url variables */
        this.activeroute.params.subscribe(params => {
            this.edit_user_id = params.uid;
        });

        this.myservice.get('/publisher/getPublishers/' + this.edit_user_id).subscribe(
            data => {
                /* fill form while updating the publisher */
                var publisher = data.user;
                this.formdata.patchValue({
                    username: publisher.username,
                    email: publisher.email,
                    fullname: publisher.fullname,
                    contact: publisher.contact,
                    price_per_tfn: publisher.price_per_tfn,
                    pub_queue: publisher.pub_queue,
                });
            }, err => {
                console.log(err);
            }
        );
        /* get publisher settings. */
        this.myservice.get('/publisher/getPublisherSettings/' + this.edit_user_id).subscribe(
            data => {
                /* fill form while updating the publisher */
                var settings = data.settings;
                this.formdata2.patchValue({
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
                    hide_campaign: settings.hide_campaign,
                    charge_per_minute: settings.charge_per_minute,
                });
            }, err => {
                console.log(err);
            }
        );

    }
    editPublisher() {
        this.success_msg = false;
        this.error = false;
        this.password_error = false;
        if (this.formdata.invalid) {
            this.error = true;
        } else {
            const data = this.formdata.value;
            data.role = 'publisher';
            if (data.passwd != '') {
                if (data.passwd != data.cnf_passwd) {
                    this.password_error = true;
                } else {
                    data.password = data.passwd;
                }
            }
            delete data.passwd;
            delete data.cnf_passwd;
            this.myservice.post('/publisher/' + this.edit_user_id, data)
                .subscribe(
                    result => {
                        if (result.user) {
                            this.router.navigate(['/users']);
                        }
                    },
                    err => {
                        console.log(err, 'error');
                    }
                );
        }
    }
    editSettings() {
        this.success_msg = false;
        this.edit_user_id;
        //console.log(this.formdata2);
        const data = this.formdata2.value;
        this.myservice.post('/publisher/settings/' + this.edit_user_id, data)
            .subscribe(
                result => {
                    if (result.settings) {
                        this.success_msg = true;
                        //this.router.navigate(['/users']);
                    }
                },
                err => {
                    console.log(err, 'error');
                }
            );
    }
}
