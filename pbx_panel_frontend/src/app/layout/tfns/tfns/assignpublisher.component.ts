import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { switchMap, debounceTime } from 'rxjs/operators';

import { routerTransition } from '../../../router.animations';
import { CommonService } from '../../../shared/services/common.service';
import { PublisherService } from '../../../shared/services/publisher.service';

@Component({
    selector: 'app-assignpublisher',
    templateUrl: './assignpublisher.component.html',
    styleUrls: ['./tfns.component.scss'],
    animations: [routerTransition()]
})
export class AssignpublisherComponent implements OnInit {
    constructor(public router: Router, private activeroute: ActivatedRoute, private myservice: CommonService, private publisherservice: PublisherService) { }
    formdata;
    error: boolean = false;
    error_message = `Enter no. less then or equal to 15 digits and greater than or equal to 10 digits only`;
    tfn_error: boolean = false;
    success_msg: boolean = false;
    isLoading: boolean = false;
    filteredPublishers: Observable<any>;
    ngOnInit() {
        this.formdata = new FormGroup({
            pub_id: new FormControl('', Validators.required),
            tfn: new FormControl('', Validators.compose([
                Validators.required,
                Validators.minLength(10),
            ])),
        });

        this.filteredPublishers = this.formdata.get('pub_id').valueChanges.pipe(
            debounceTime(200),
            switchMap(value => this.publisherservice.search(value))
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

        if (this.formdata.invalid) {
            this.error = true;
        } else {
            const data = this.formdata.value;
            const tfnArr = data.tfn.split('\n');
            const tempArr = [];
            tfnArr.forEach((tfn, index) => {
                tempArr.push(tfn);
            });
            data.tfn = tempArr;
            if (!(data.pub_id > 0)) {
                if (data.pub_id.uid !== undefined) {
                    data.pub_id = data.pub_id.uid;
                }
            }
            data.status = 'unused';
            /* console.log(data); */
            this.myservice.post('/addTfn/', data)
                .subscribe(
                    result => {
                        /* console.log(result); */
                        if (result.success == "OK") {
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
        //if the letter is not digit then display error and don't type anything
        const keysValue = [0, 8, 13, 17, 86, 16, 107, 187];
        // console.log($event.which, keysValue.indexOf($event.which));
        if (keysValue.indexOf($event.which) === -1 &&
            !(($event.which >= 48 && $event.which <= 57) || ($event.which >= 97 && $event.which <= 105))) {
            //display error message
            this.tfn_error = true;
            this.error_message = `Enter digits only.`;
        } else {
            let tfn_val = $event.target.value;
            let tfns_arr = tfn_val.split('\n');
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
