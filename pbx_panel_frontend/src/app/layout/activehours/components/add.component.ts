import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { routerTransition } from '../../../router.animations';
import { CommonService } from '../../../shared/services/common.service';

@Component({
    selector: 'app-add',
    templateUrl: './add.component.html',
    styleUrls: ['./common.component.scss'],
    animations: [routerTransition()]
})
export class AddComponent implements OnInit {
    constructor(public router: Router, private myservice: CommonService) { }
    formdata;
    error = false;
    show_error = false;
    error_message = ``;
    ngOnInit() {
        this.formdata = new FormGroup({
            day: new FormControl('', Validators.required),
            tfn: new FormControl('', Validators.compose([
                Validators.required,
                Validators.minLength(4),
                Validators.maxLength(15),
            ])),
            active_on: new FormControl('', Validators.compose([
                Validators.required,
            ])),
            active_off: new FormControl('', Validators.compose([
                Validators.required,
            ])),
        });
    }
    addActiveHour() {
        this.error = false;
        if (this.formdata.invalid) {
            this.error = true;
        } else {
            const data = this.formdata.value;
            data.day = data.day.join(',');
            data.active_on = this.changeTimeData(data.active_on.hour) + ':' + this.changeTimeData(data.active_on.minute) + ':00';
            data.active_off = this.changeTimeData(data.active_off.hour) + ':' + this.changeTimeData(data.active_off.minute) + ':00';
            /* console.log(data); */
            this.myservice.post('/ActiveHours/add', data)
                .subscribe(
                    result => {
                        if (result.activeHour) {
                            this.router.navigate(['/activehours']);
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
    changeTimeData(d) {
        return (1 === d.toString().length) ? '0' + d : d;
    }
}
