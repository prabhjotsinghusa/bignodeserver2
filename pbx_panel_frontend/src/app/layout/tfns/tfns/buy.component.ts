import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { switchMap, debounceTime } from 'rxjs/operators';

import { routerTransition } from '../../../router.animations';
import { CommonService } from '../../../shared/services/common.service';

import { PublisherService } from '../../../shared/services/publisher.service';

@Component({
    selector: 'buy-add',
    templateUrl: './buy.component.html',
    styleUrls: ['./tfns.component.scss'],
    animations: [routerTransition()]
})
export class BuyComponent implements OnInit {
    loggedUser;
    loggedUserSettings;
    formdata;
    error: boolean = false;
    error_message = `Enter no. less then or equal to 15 digits and greater than or equal to 10 digits only`;
    tfn_error: boolean = false;
    price_per_tfn = 0;
    available_tfns: any = [];

    isLoading: boolean = false;
    filteredPublishers: Observable<any>;
    dropdownList = [];
    selectedItems = [];
    dropdownSettings = {};
    constructor(public router: Router, private myservice: CommonService, private publisherservice: PublisherService) {
        this.loggedUser = JSON.parse(localStorage.getItem('user'));
        this.loggedUserSettings = JSON.parse(localStorage.getItem('userSettings'));
        this.price_per_tfn = this.loggedUser.price_per_tfn;
    }


    ngOnInit() {
        if (this.loggedUser.role != 'publisher') {
            this.router.navigate(['/access-denied']);
        }
        this.myservice.get('/getAvailableTfn/')
            .subscribe(
                data => {
                    this.available_tfns = data.tfn;
                },
                err => {
                    console.log(err, 'error');
                }
            );
        this.formdata = new FormGroup({
            tfn: new FormControl('', Validators.compose([
                Validators.required,
            ])),
        });
        /* this.dropdownList = [
            { item_id: 1, item_text: 'Mumbai' },
            { item_id: 2, item_text: 'Bangaluru' },
            { item_id: 3, item_text: 'Pune' },
            { item_id: 4, item_text: 'Navsari' },
            { item_id: 5, item_text: 'New Delhi' }
        ];
        this.selectedItems = [
            { item_id: 3, item_text: 'Pune' },
            { item_id: 4, item_text: 'Navsari' }
        ]; */
        this.dropdownSettings = {
            singleSelection: false,
            idField: 'tfn',
            textField: 'tfn',
            selectAllText: 'Select All',
            unSelectAllText: 'UnSelect All',
            itemsShowLimit: 10,
            allowSearchFilter: false,
            maxHeight: 400
        };

    }
    onItemSelect(item: any) {
        console.log(item);
        this.checkTFN();
      }
    onSelectAll(items: any) {
        this.formdata.value.tfn = items;
        this.checkTFN();
    }
    buyTfn() {
        this.error = false;
        this.tfn_error = false;
        if (this.formdata.invalid) {
            this.error = true;
        } else {
            const data = this.formdata.value;
            data.user = this.loggedUser;
            data.userSettings = this.loggedUserSettings;
     
            this.myservice.post('/buyTfn/', data)
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
    checkTFN() {
        this.tfn_error = false;
        // if the letter is not digit then display error and don't type anything
        const data = this.formdata.value;
        data.user = this.loggedUser;
        data.userSettings = this.loggedUserSettings;
        this.myservice.post('/checkTfn/', data)
            .subscribe(
                result => {
                    console.log(result);
                    if (result.success === 'NOK') {
                        this.tfn_error = true;
                        this.error_message = result.message;
                    }
                },
                err => {
                    console.log(err, 'error');
                }
            );

    }
}
