import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { routerTransition } from '../../../router.animations';
import { CommonService } from '../../../shared/services/common.service';

@Component({
    selector: 'app-buyernumber',
    templateUrl: './buyernumber.component.html',
    styleUrls: ['./buyers.component.scss'],
    animations: [routerTransition()]
})
export class BuyernumberComponent implements OnInit {
    loggedUser;
    loggedUserSettings;
    constructor(public router: Router, private activeroute: ActivatedRoute, private myservice: CommonService) { 

        this.loggedUser = JSON.parse(localStorage.getItem('user'));
        this.loggedUserSettings = JSON.parse(localStorage.getItem('userSettings'));
    }
    formdata;
    error = false;
    isLoading = true;
    edit_buyer_id = 0;
    buyer_numbers: any = [];
    success_show = false;
    delete_show = false;
    buyer;
    ngOnInit() {
        this.formdata = new FormGroup({
            buyer_number: new FormControl('', Validators.compose([
                Validators.required,
                Validators.minLength(3),
                Validators.maxLength(15),
            ])),
        });
        /* get url variables */
        this.activeroute.params.subscribe(params => {
            this.edit_buyer_id = params.buyer_id;
        });

        /* /BuyerNumbers/getBuyerNumber/344 */
        this.myservice.get('/BuyerNumbers/getBuyerNumber/' + this.edit_buyer_id).subscribe(
            data => {
                this.buyer_numbers = data.buyerNumber;
            }, err => {
                console.log(err);
            }
        );
        this.myservice.get('/buyer/getBuyer/' + this.edit_buyer_id).subscribe(
            data => {
                this.buyer = data.buyer;
                this.isLoading = false;
            }, err => {
                this.isLoading = false;
                console.log(err);
            }
        );
    }

    saveBuyerNumber() {
        this.error = false;
        this.success_show = false;
        if (this.formdata.invalid) {
            this.error = true;
        } else {
            const data = this.formdata.value;
            data.buyer_id = this.edit_buyer_id;
            data.number = data.buyer_number;
            delete data.buyer_number;
            this.isLoading = true;
            this.myservice.post('/BuyerNumbers/add', data)
                .subscribe(
                    result => {
                        if (result.buyerNumber) {
                            this.buyer_numbers.push(result.buyerNumber);
                            this.success_show = true;
                            this.isLoading = false;
                        }
                    },
                    err => {
                        this.isLoading = false;
                        console.log(err, 'error');
                    }
                );

        }
    }
    deleteBuyerNumber(id) {
        this.buyer_numbers.forEach((bn, index) => {
            if (bn['_id'] === id) {
                this.myservice.delete('/BuyerNumbers/delete/' + id)
                    .subscribe(
                        result => {
                            if (result.success === 'OK') {
                                this.buyer_numbers.splice(index);
                                this.delete_show = true;
                            }
                        },
                        err => {
                            console.log(err, 'error');
                        }
                    );
            }
        });
    }
}
