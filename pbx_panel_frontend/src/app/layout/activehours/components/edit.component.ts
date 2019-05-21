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
    constructor(public router: Router, private activeroute: ActivatedRoute, private myservice: CommonService) { }
    formdata;
    error: boolean = false;
    success_msg: boolean = false;
    show_error: boolean = false;
    error_message = ``;
    edit_id = 0;
    weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    ngOnInit() {
        this.formdata = new FormGroup({
            day: new FormControl('', Validators.required),
            tfn: new FormControl({ value: '', disabled: true }),
            active_on: new FormControl('', Validators.compose([
                Validators.required,
            ])),
            active_off: new FormControl('', Validators.compose([
                Validators.required,
            ])),
        });

        /* get url variables */
        this.activeroute.params.subscribe(params => {
            this.edit_id = params.id;
        });

        this.myservice.get('/ActiveHours/getActiveHour/' + this.edit_id).subscribe(
            data => {
                const activehour = data.activeHours[0];
                console.log(activehour);
                const active_on = this.changeValueStrToTime(activehour.active_on);
                const active_off = this.changeValueStrToTime(activehour.active_off);

                this.formdata.patchValue({
                    day: activehour.day.split(','),
                    tfn: activehour.tfn,
                    active_on: active_on,
                    active_off: active_off,
                });
            }, err => {
                console.log(err);
            }
        );

    }
    changeValueStrToTime(d) {
        const arr = d.split(':');
        return { hour: parseInt(arr[0], 10), minute: parseInt(arr[1], 10) };
    }
    changeTimeData(d) {
        return (1 === d.toString().length) ? '0' + d : d;
    }
    editActiveHour() {
        this.error = false;

        if (this.formdata.invalid) {
            this.error = true;
        } else {
            const data = this.formdata.value;
            data.day = data.day.join(',');
            data.active_on = this.changeTimeData(data.active_on.hour) + ':' + this.changeTimeData(data.active_on.minute) + ':00';
            data.active_off = this.changeTimeData(data.active_off.hour) + ':' + this.changeTimeData(data.active_off.minute) + ':00';
            console.log(data);
            this.myservice.put('/ActiveHours/update/' + this.edit_id, data)
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

}
