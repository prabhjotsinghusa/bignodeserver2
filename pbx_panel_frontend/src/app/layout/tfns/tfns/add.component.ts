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
    styleUrls: ['./tfns.component.scss'],
    animations: [routerTransition()]
})
export class AddComponent implements OnInit {
    constructor(public router: Router, private myservice: CommonService, private publisherservice: PublisherService) { }
    formdata;
    error = false;
    error_message = `Enter no. less then or equal to 15 digits and greater than or equal to 10 digits only`;
    tfn_error = false;

    isLoading = false;
    filteredPublishers: Observable<any>;
    ngOnInit() {
        this.formdata = new FormGroup({
            tfn: new FormControl('', Validators.compose([
                Validators.required,
                Validators.minLength(10),
            ])),
        });
    }
    addTfn() {
        this.error = false;
        this.tfn_error = false;
        if (this.formdata.invalid) {
            this.error = true;
        } else {
            const data = this.formdata.value;
            const tfnArr = data.tfn.split('\n');
            const tempArr = [];
            tfnArr.forEach((tfn, index) => {
                tempArr.push(tfn);
                /* if (tfn.indexOf(1) === 0) {
                    tempArr.push(tfn);
                } else {
                    tempArr.push(1 + tfn);
                } */
            });
            data.tfn = tempArr;

            /* console.log(data); */
            this.myservice.post('/addTfn/', data)
                .subscribe(
                    result => {
                        if (result.success === 'OK') {
                            this.router.navigate(['/tfns']);
                        }
                    },
                    err => {
                        console.log(err, 'error');
                    }
                );

        }
    }
    checkTFN($event) {
        // if the letter is not digit then display error and don't type anything

        const keysValue = [0, 8, 13, 17, 86, 16, 107, 187];
        console.log($event.which, keysValue.indexOf($event.which));
        if (keysValue.indexOf($event.which) === -1 &&
            !(($event.which >= 48 && $event.which <= 57) || ($event.which >= 97 && $event.which <= 105))) {
            // display error message
            this.tfn_error = true;
            this.error_message = `Enter digits only.`;
        } else {
            const tfn_val = $event.target.value;
            const tfns_arr = tfn_val.split('\n');
            let err = false;
            let msg = ``;
            tfns_arr.forEach(function (value, index) {
                if (value.length > 15) {
                    err = true;
                    msg = `Enter no. less then or equal to 15 digits and greater than or equal to 10 digits only`;
                }
                if (value.length < 10) {
                    err = true;
                    msg = `Enter no. less then or equal to 15 digits and greater than or equal to 10 digits only`;
                }
                if (isNaN(value)) {
                    err = true;
                    msg = `Enter digits only.`;
                }
            });
            if (err) {
                this.tfn_error = true;
                this.error_message = msg;
            } else {
                this.tfn_error = false;
                this.error_message = ``;
            }
        }
    }
}
