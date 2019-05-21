import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { routerTransition } from '../../../router.animations';
import { CommonService } from '../../../shared/services/common.service';

@Component({
    selector: 'app-edit',
    templateUrl: './edit.component.html',
    styleUrls: ['./common.component.scss'],
    animations: [routerTransition()]
})
export class EditComponent implements OnInit {
    loggedUser;
    loggedUserSettings;
    constructor(public router: Router, private activeroute: ActivatedRoute, private myservice: CommonService) { 
        this.loggedUser = JSON.parse(localStorage.getItem('user'));
        this.loggedUserSettings = JSON.parse(localStorage.getItem('userSettings'));
    }
    formdata;
    error: boolean = false;
    success_msg: boolean = false;
    show_error: boolean = false;
    error_message = ``;
    edit_id = 0;

    ngOnInit() {
        this.formdata = new FormGroup({
            queue: new FormControl({ value: '', disabled: true }),
            buyer_number: new FormControl({ value: '', disabled: true }),
            capping: new FormControl('', Validators.compose([
                Validators.required,
                Validators.minLength(1),
                Validators.maxLength(15),
            ])),
            global_cap: new FormControl('', Validators.compose([
                Validators.required,
                Validators.maxLength(15),
            ])),
        });
        /* get url variables */
        this.activeroute.params.subscribe(params => {
            this.edit_id = params.id;
        });

        this.myservice.get('/cappings/get/?id=' + this.edit_id).subscribe(
            data => {
                const capping = data.capping;
                this.formdata.patchValue({
                    queue: capping.queue,
                    buyer_number: capping.buyer_number,
                    capping: capping.capping,
                    global_cap: capping.global_cap
                });
            }, err => {
                console.log(err);
            }
        );
    }
    save() {
        this.error = false;
        if (this.formdata.invalid) {
            this.error = true;
        } else {
            const data = this.formdata.value;
            this.myservice.put('/cappings/update/' + this.edit_id, data)
                .subscribe(
                    result => {
                        if (result.capping) {
                            this.router.navigate(['/buyercapping']);
                        }
                        if (result.success == 'NOK') {
                            this.error_message = result.message;
                            this.show_error = true;
                        }
                    },
                    err => {
                        console.log(err, 'error');
                    }
                );
        }
    }

}
