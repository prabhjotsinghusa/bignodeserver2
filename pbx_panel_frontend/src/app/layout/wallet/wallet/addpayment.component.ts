import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { MatAutocompleteSelectedEvent, MatChipInputEvent, MatAutocomplete } from '@angular/material';
import * as moment from "moment";

import { routerTransition } from '../../../router.animations';
import { CommonService } from '../../../shared/services/common.service';
import { PublisherService } from '../../../shared/services/publisher.service';
import { map, startWith } from 'rxjs/operators';


@Component({

    selector: 'app-addpayment',
    templateUrl: './addpayment.component.html',
    styleUrls: ['./addpayment.component.scss'],
    animations: [routerTransition()]
})
export class AddpaymentComponent implements OnInit {

    loggedUser;
    formdata;
    error = false;
    isLoading = false;
    checkother = false;
    show_success = false;

    visible = true;
    selectable = true;
    removable = true;
    addOnBlur = true;
    separatorKeysCodes: number[] = [ENTER, COMMA];
    publishersCtrl = new FormControl('');
    filteredpublishers: Observable<any[]>;
    publishers: any[] = [];
    allPublishers: any[] = [];

    @ViewChild('pubInput') pubInput: ElementRef<HTMLInputElement>;
    @ViewChild('auto') matAutocomplete: MatAutocomplete;

    constructor(
        public router: Router,
        private myservice: CommonService,
        private publisherservice: PublisherService
    ) {
        this.publisherservice.search('').subscribe(data => this.allPublishers = data.user);
        this.filteredpublishers = this.publishersCtrl.valueChanges.pipe(
            startWith(null),
            map((pub: string | null) => pub ? this._filter(pub) : this.allPublishers.slice()));
    }

    ngOnInit() {
        this.formdata = new FormGroup({
            mode: new FormControl('', Validators.compose([
                Validators.required,
            ])),
            amount: new FormControl('', Validators.compose([
                Validators.required,
                Validators.min(1)
            ])),
            paymentDate: new FormControl(new Date(), Validators.compose([
                Validators.required,
            ])),
            remarks: new FormControl('', Validators.compose([
                Validators.required,
                Validators.minLength(1),
            ])),
            publishersCtrl: new FormControl(''),
        });
    }

    add(event: MatChipInputEvent): void {
        if (!this.matAutocomplete.isOpen) {
            const input = event.input;
            const value = event.value;

            this.publishers.forEach(function (item, index) {
                if (item.uid === value || ''.trim()) {
                    this.publishers.push(value.trim());
                }
            });

            if (input) {
                input.value = '';
            }

            this.publishersCtrl.setValue(null);
        }
    }

    remove(fruit: string): void {
        const index = this.publishers.indexOf(fruit);
        if (index >= 0) {
            this.publishers.splice(index, 1);
        }
    }

    selected(event: MatAutocompleteSelectedEvent): void {

        const pub = event.option.value;
        let check = true;
        this.publishers.forEach(function (item, index) {
            if (item.uid === pub.uid) {
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
        if (value.fullname === undefined) {
            filterValue = value.toLowerCase();
        } else {
            filterValue = value.fullname.toLowerCase();
        }
        /* console.log(filterValue); */
        return this.allPublishers.filter(pub => pub.fullname.toLowerCase().indexOf(filterValue) === 0);

    }

    hideLoader() {
        this.isLoading = false;
    }

    showLoader() {
        this.isLoading = true;
    }

    addPayment() {
        if (this.formdata.invalid) {
            this.error = true;
        } else {
            const data = this.formdata.value;
            data.paymentDate = moment(data.paymentDate).format('YYYY-MM-DD HH:mm:ss');
            data.publishers = this.publishers;
            console.log(data);
            this.myservice.post('/wallet/addPublisherBalance/', data)
                .subscribe(
                    result => {
                        if (result.success === 'OK') {
                            this.show_success = true;
                            this.formdata.reset();
                            this.publishers = [];
                        }
                    },
                    err => {
                        console.log(err, 'error');
                    }
                );

        }
    }


}
