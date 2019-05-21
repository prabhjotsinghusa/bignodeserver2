import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';


import { routerTransition } from '../../../router.animations';
import { CommonService } from '../../../shared/services/common.service';

@Component({
    selector: 'app-edit',
    templateUrl: './edit.component.html',
    styleUrls: ['./audit.component.scss'],
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
    pub_queues = [{ name: 'travel', value: 'Travel' }, { name: 'tech', value: 'Tech' }, { name: 'others', value: 'Others' }];
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
            pub_queue: new FormControl(''),
            status: new FormControl('active'),
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
                    pub_queue: publisher.pub_queue,
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
            let data = this.formdata.value;
            data.role = 'audit_profile';
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
                    data => {
                        if (data.user) {
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
