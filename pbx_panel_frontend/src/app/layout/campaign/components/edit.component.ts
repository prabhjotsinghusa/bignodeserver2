import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { switchMap, debounceTime } from 'rxjs/operators';
import { NgbModal, ModalDismissReasons, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { routerTransition } from '../../../router.animations';
import { CommonService } from '../../../shared/services/common.service';
import { PublisherService } from '../../../shared/services/publisher.service';

@Component({
    selector: 'app-edit',
    templateUrl: './edit.component.html',
    styleUrls: ['./common.component.scss'],
    animations: [routerTransition()]
})
export class EditComponent implements OnInit {
    loggedUser;
    formdata;
    formdata2;
    error = false;
    error2 = false;
    password_error = false;
    isLoading = false;
    show_error = false;
    checkother = false;
    error_message = ``;

    buyer_number_error = false;
    filteredPublishers: Observable<any>;
    show_pub_template = false;
    selected_pub = { uid: 0, fullname: '' };
    selected_publisher;
    selected_pub_settings;
    selected_tfns = [];
    publisher_buyers;
    selected_buyers = [];
    buyer_numbers = [];
    selected_buyer_numbers = [];
    ivr_details = [];
    pub_tfn = [];
    optionsArr = [{ key: 0, value: 'Disable' }, { key: 1, value: 'Enable' }];
    priorities = new Array(10);
    closeResult: string;
    modalReference: NgbModalRef;
    edit_campaign_id = 0;
    edit_pub_id = 0;
    camp_buyer_tfns;
    camp_pub_tfns;
    edit_inside_route = 0;
    show_add_button = true;
    constructor(public router: Router, private myservice: CommonService, private publisherservice: PublisherService,
        private modalService: NgbModal, private activeroute: ActivatedRoute) {
        this.loggedUser = this.selected_publisher = JSON.parse(localStorage.getItem('user'));
    }

    ngOnInit() {
        /* get url variables */
        this.activeroute.params.subscribe(params => {
            this.edit_campaign_id = params.id;
        });

        this.formdata = new FormGroup({
            camp_name: new FormControl('', Validators.compose([
                Validators.required,
                Validators.minLength(4),
            ])),
            buffer_time: new FormControl('', Validators.compose([
                Validators.required,
            ])),
            price_per_call: new FormControl('', Validators.compose([
                Validators.required,
            ])),
            time_zone: new FormControl('CST'),
            pub_id: new FormControl('', Validators.required),
            read_only: new FormControl(0),
            inside_route: new FormControl(''),

        });

        this.filteredPublishers = this.formdata.get('pub_id').valueChanges.pipe(
            debounceTime(200),
            switchMap(value => this.publisherservice.search(value))
        );

        this.myservice.get('/Campaign/getCampaignByCampaignId/' + this.edit_campaign_id).subscribe(
            data => {
                const campaign = data.campaigns[0];
                this.edit_pub_id = campaign.pub_id;
                this.formdata.patchValue({
                    pub_id: campaign.pub_id,
                    camp_name: campaign.camp_name,
                    time_zone: campaign.time_zone,
                    read_only: campaign.read_only,
                    price_per_call: campaign.price_per_call,
                    buffer_time: campaign.buffer_time,
                    inside_route: campaign.inside_route,
                    status: campaign.status
                });
                /* getting the publisher name and id */
                if (this.loggedUser.role === 'publisher') {
                    this.formdata.patchValue({
                        pub_id: this.loggedUser.uid,
                    });
                    this.selected_publisher = this.loggedUser;
                    this.selected_pub = { uid: this.loggedUser.uid, fullname: this.loggedUser.fullname };
                    this.selected_buyer_numbers = [];
                    this.editPublisherData();
                } else if (this.loggedUser.role === 'admin') {
                    this.myservice.get('/publisher/getPublishers/' + this.edit_pub_id).subscribe(
                        result => {
                            const user = result.user;
                            this.formdata.patchValue({
                                pub_id: { uid: user.uid, fullname: user.fullname },
                            });
                            this.selected_pub = { uid: user.uid, fullname: user.fullname };
                            this.selected_publisher = user;
                            this.selected_buyer_numbers = [];
                            this.editPublisherData();
                        }, err => {
                            console.log(err);
                        }
                    );
                } else {
                    this.router.navigate(['/access-denied']);
                }
            }, err => {
                console.log(err);
            }
        );
    }
    otherInsideroute() {
        this.formdata.patchValue({
            inside_route: ''
        });
        this.checkother = true;
    }
    hideLoader() {
        this.isLoading = false;

        if (this.formdata.get('pub_id').value) {

            this.selected_pub = this.formdata.get('pub_id').value;
            console.log(this.selected_pub.uid);
            if (this.selected_pub.uid > 0) {
                /* Get selected publisher details */
                this.myservice.get('/publisher/getPublishers/' + this.selected_pub.uid).subscribe(
                    data => {
                        /* fill form while updating the publisher */
                        this.selected_publisher = data.user;
                        this.formdata.patchValue({
                            inside_route: '',
                        });
                        this.selected_buyer_numbers = [];
                    }, err => {
                        console.log(err);
                    }
                );
                /* Get selected publisher settings */
                this.myservice.get('/publisher/getPublisherSettings/' + this.selected_pub.uid).subscribe(
                    data => {
                        /* fill form while updating the publisher */
                        this.selected_pub_settings = data.settings;
                        this.show_pub_template = true;
                        if (this.selected_pub_settings.enable_outside_route) {
                            /* Get all buyers of the publisher*/
                            this.myservice.get('/buyer/getBuyerByPubId/' + this.selected_pub.uid).subscribe(
                                res => {
                                    this.publisher_buyers = res.buyer;
                                    if (this.publisher_buyers) {
                                        this.buyer_numbers = [];
                                        this.publisher_buyers.forEach((buyer, index) => {
                                            /* Get all buyers numbers of the buyer*/
                                            if (buyer.status === 'active') {
                                                this.myservice.get('/BuyerNumbers/getBuyerNumber/' + buyer.buyer_id).subscribe(
                                                    result => {
                                                        const buyerNumber = result.buyerNumber;
                                                        this.buyer_numbers[buyer.buyer_id] = buyerNumber;
                                                        /* console.log(this.buyer_numbers); */
                                                    }, err => {
                                                        console.log(err);
                                                    }
                                                );
                                            }

                                        });
                                    }
                                }, err => {
                                    console.log(err);
                                }
                            );
                        }
                        if (this.selected_pub_settings.number_to_ivr) {
                            this.myservice.get('/Campaign/getAllIvrDetails/').subscribe(
                                res => {
                                    this.ivr_details = res.ivrDetails;
                                    this.formdata.patchValue({
                                        inside_route: 'ivr-' + res.ivrDetails[0].id + ',s,1',
                                    });
                                }, err => {
                                    console.log(err);
                                }
                            );
                        }
                    }, err => {
                        console.log(err);
                    }
                );
                /* Get all tfn of the publisher */
                this.myservice.get('/getTfnByPublisher/' + this.selected_pub.uid).subscribe(
                    data => {
                        this.selected_tfns = [];
                        this.pub_tfn = data.tfn;
                        this.pub_tfn = this.pub_tfn.filter(tfn => {
                            if (!(tfn.status === 'pending' || tfn.status === 'used')) {
                                return true;
                            }
                        });
                    }, err => {
                        console.log(err);
                    }
                );
            }
        }
    }
    editPublisherData() {
        if (this.selected_pub.uid > 0) {
            /* Get selected publisher settings */
            this.myservice.get('/publisher/getPublisherSettings/' + this.selected_pub.uid).subscribe(
                data => {
                    /* fill form while updating the publisher */
                    this.selected_pub_settings = data.settings;
                    this.show_pub_template = true;
                    if (this.selected_pub_settings.enable_outside_route) {
                        /* publisher buyer limit check */
                        this.myservice.get('/buyer/getBuyerByPubId/' + this.loggedUser.uid)
                            .subscribe(res => {
                                if (this.selected_pub_settings.buyer_limit < res.buyer.length) {
                                    this.show_add_button = false;
                                }
                            });
                        /* Get all buyers of the publisher*/
                        this.myservice.get('/buyer/getBuyerByPubId/' + this.selected_pub.uid).subscribe(
                            res => {
                                this.publisher_buyers = res.buyer;
                                if (this.publisher_buyers) {
                                    this.buyer_numbers = [];
                                    this.myservice.get('/Campaign/getCampBuyerTfns/' + this.edit_campaign_id).subscribe(
                                        result2 => {
                                            this.camp_buyer_tfns = result2.buyer_tfns;
                                            this.publisher_buyers.forEach((buyer, index) => {
                                                /* Get all buyers numbers of the buyer*/
                                                if (buyer.status === 'active') {
                                                    this.myservice.get('/BuyerNumbers/getBuyerNumber/' + buyer.buyer_id).subscribe(
                                                        result => {
                                                            const buyerNumber = result.buyerNumber;
                                                            buyerNumber.filter(bn => {
                                                                bn.cccapping = 0;
                                                                bn.priority = 0;
                                                                bn.penalty = 0;
                                                                this.camp_buyer_tfns.forEach(cpbntfn => {
                                                                    if (cpbntfn.buyers_no === bn.number &&
                                                                        cpbntfn.buyer_id === bn.buyer_id) {
                                                                        bn.status = 'used';
                                                                        bn.cccapping = cpbntfn.cccapping;
                                                                        bn.priority = cpbntfn.priority;
                                                                        bn.penalty = cpbntfn.penalty;
                                                                        this.selected_buyer_numbers.push({
                                                                            buyer_id: bn.buyer_id,
                                                                            buyer_number: bn.number,
                                                                            priority: bn.priority,
                                                                            cccapping: bn.cccapping
                                                                        });
                                                                    }
                                                                });
                                                                return bn;
                                                            });
                                                            this.buyer_numbers[buyer.buyer_id] = buyerNumber;

                                                        }, err => {
                                                            console.log(err);
                                                        }
                                                    );
                                                }

                                            });
                                        }, err => {
                                            console.log(err);
                                        }
                                    );
                                }
                            }, err => {
                                console.log(err);
                            }
                        );
                    }
                    /* IVR details entries for update campaign */
                    if (this.selected_pub_settings.number_to_ivr) {
                        this.myservice.get('/Campaign/getAllIvrDetails/').subscribe(
                            res => {
                                this.ivr_details = res.ivrDetails;
                                this.formdata.patchValue({
                                    inside_route: 'ivr-' + res.ivrDetails[0].id + ',s,1',
                                });
                            }, err => {
                                console.log(err);
                            }
                        );
                    } else {
                        if (this.selected_pub_settings.enable_inside_route && !this.selected_pub_settings.enable_outside_route) {
                            this.myservice.get('/Campaign/getCampBuyerTfns/' + this.edit_campaign_id).subscribe(
                                result2 => {
                                    this.camp_buyer_tfns = result2.buyer_tfns;
                                    this.formdata.patchValue({
                                        inside_route: this.camp_buyer_tfns[0].buyers_no,
                                    });
                                    // console.log(this.camp_buyer_tfns[0].buyers_no);
                                }, err => {
                                    console.log(err);
                                }
                            );
                        }
                    }
                }, err => {
                    console.log(err);
                }
            );
            /* Get all tfn of the publisher */
            this.myservice.get('/getTfnByPublisher/' + this.selected_pub.uid).subscribe(
                data => {
                    this.pub_tfn = data.tfn;
                    this.selected_tfns = [];
                    /* Get all tfn of the publisher from campaign */
                    this.myservice.get('/Campaign/getCampPubTfns/' + this.edit_campaign_id).subscribe(
                        data2 => {
                            this.camp_pub_tfns = data2.pub_tfns;
                            this.pub_tfn = this.pub_tfn.filter((ptfn) => {
                                if (!(ptfn.status === 'used' || ptfn.status === 'pending')) { return true; }
                                /* checking the tfn presend in the camp pub tfn collections */
                                if ((data2.pub_tfns.filter((camppubtfn) => {
                                    if (camppubtfn.tfn === ptfn.tfn) {
                                        this.selected_tfns.push(ptfn.tfn);
                                        return true;
                                    }
                                })).length > 0) {
                                    return true;
                                }
                            });
                        }, err => {
                            console.log(err);
                        }
                    );
                }, err => {
                    console.log(err);
                }
            );
        }

    }
    showLoader() {
        this.isLoading = true;
    }

    displayFn(publisher) {
        if (publisher) { return publisher.fullname; }
    }
    selectTFN(event) {
        if (event.target.checked) {
            this.selected_tfns.push(event.target.value);
        } else {
            this.selected_tfns.forEach((value, index) => {
                if (value === event.target.value) {
                    this.selected_tfns.splice(index, 1);
                }
            });
        }
        /* console.log(this.selected_tfns); */
    }
    selectBuyer(event) {
        /* const et: HTMLElement = <HTMLElement>document.querySelector('.check_' + event.target.value);
        et.click(); */
        const elements = document.getElementsByClassName('check_' + event.target.value);
        for (let i = 0, len = elements.length; i < len; i++) {
            const ele = (<HTMLInputElement>elements[i]);
            ele.click();
        }
    }
    selectBuyerNumber(event, buyer_id) {
        const priority = (<HTMLInputElement>document.getElementById('priority_' + buyer_id + '_' + event.target.value)).value || 0;
        const cccapping = (<HTMLInputElement>document.getElementById('cccapping_' + buyer_id + '_' + event.target.value)).value || 0;

        if (event.target.checked) {
            this.selected_buyer_numbers.push({
                buyer_id: buyer_id,
                buyer_number: event.target.value,
                priority: priority,
                cccapping: cccapping
            });
        } else {
            this.selected_buyer_numbers.forEach((bn_number, index) => {
                if (bn_number.buyer_id === buyer_id && bn_number.buyer_number === event.target.value) {
                    this.selected_buyer_numbers.splice(index, 1);
                }
            });
        }
    }
    open(addBuyer) {
        this.formdata2 = new FormGroup({
            name: new FormControl('', Validators.compose([
                Validators.required,
                Validators.minLength(1),
            ])),
            email: new FormControl('', Validators.compose([
                Validators.required,
                Validators.minLength(1),
                Validators.email
            ])),
            passwd: new FormControl('', Validators.compose([
                Validators.required,
                Validators.minLength(8),
            ])),
            cnf_passwd: new FormControl('', Validators.compose([
                Validators.required,
            ])),
            contact: new FormControl('', Validators.compose([Validators.required, Validators.minLength(10), Validators.maxLength(10)])),
            address: new FormControl('', Validators.compose([Validators.required, Validators.minLength(4), Validators.maxLength(200)])),
            price_per_call: new FormControl('', Validators.compose([
                Validators.required,
            ])),
            buffer_time: new FormControl('', Validators.required),
            /* buyer_number: new FormControl('', Validators.compose([
                Validators.required,
                Validators.minLength(3),
                Validators.maxLength(15),
            ])), */
            buyer_number: new FormArray([new FormControl('', Validators.required)]),

        });
        this.modalReference = this.modalService.open(addBuyer);
        this.modalReference.result.then((result) => {
            this.closeResult = `Closed with: ${result}`;
        }, (reason) => {
            this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        });
    }

    private getDismissReason(reason: any): string {
        if (reason === ModalDismissReasons.ESC) {
            return 'by pressing ESC';
        } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
            return 'by clicking on a backdrop';
        } else {
            return `with: ${reason}`;
        }
    }
    selectPriority(event) {
        (<HTMLElement>event.target.parentNode.parentNode).click();
    }
    addMoreBuyerNumber() {
        this.error2 = false;
        (<FormArray>this.formdata2.get('buyer_number')).push(new FormControl('', Validators.required));
        console.log(this.formdata2.get('buyer_number').controls);
    }
    deleteBuyerNumber(index) {
        this.error2 = false;
        (<FormArray>this.formdata2.get('buyer_number')).removeAt(index);
    }

    addBuyerWithNumber() {
        console.log(this.formdata2);
        this.error2 = false;
        this.password_error = false;
        this.buyer_number_error = false;
        if (this.formdata2.invalid) {
            this.error2 = true;
        } else {
            const data = this.formdata2.value;

            if (data.passwd !== data.cnf_passwd) {
                this.password_error = true;
            } else {
                data.password = data.passwd;
                data.pub_id = this.selected_pub.uid;
                const buyer_numbers = data.buyer_number;
                delete data.passwd;
                delete data.cnf_passwd;
                delete data.buyer_number;
                console.log(data, buyer_numbers);

                this.myservice.post('/buyer/', data)
                    .subscribe(
                        result => {
                            if (result.buyer) {
                                console.log(result);
                                buyer_numbers.forEach((nm, index) => {
                                    const dd = {
                                        buyer_id: result.buyer.buyer_id,
                                        number: nm
                                    };
                                    console.log(dd);
                                    this.myservice.post('/BuyerNumbers/add', dd)
                                        .subscribe(
                                            result2 => {
                                                console.log(result2);
                                                if (result2.buyerNumber) {
                                                    this.modalReference.close();
                                                    this.hideLoader();
                                                } else {
                                                    this.buyer_number_error = true;
                                                }
                                            },
                                            err => {
                                                console.log(err, 'error');
                                            }
                                        );
                                });

                            } else {
                                this.buyer_number_error = true;
                            }
                        },
                        err => {
                            console.log(err, 'error');
                        }
                    );
            }
        }
    }
    editCampaign() {
        this.error = false;
        this.show_error = false;

        if (this.formdata.invalid) {
            this.error = true;
        } else {
            const data = this.formdata.value;
            data.camp_pub_tfns = this.camp_pub_tfns;
            data.camp_buyer_tfns = this.camp_buyer_tfns;
            console.log(this.selected_pub);
            console.log(this.selected_tfns);
            console.log(this.selected_buyer_numbers);
            console.log(data);
            if (data.pub_id.uid > 0) {
                data.pub_id = data.pub_id.uid;
            }

            if (this.selected_tfns.length > 0) {
                data.tfns = this.selected_tfns;
                if (this.selected_pub_settings.enable_outside_route && !this.selected_pub_settings.number_to_ivr) {
                    if (this.selected_buyer_numbers.length > 0) {
                        data.buyer_numbers = this.selected_buyer_numbers;
                        console.log(data);
                        this.myservice.post('/Campaign/edit/' + this.edit_campaign_id, data)
                            .subscribe(
                                result => {
                                    if (result.success === 'OK') {
                                        this.router.navigate(['/campaign']);
                                    }
                                },
                                err => {
                                    console.log(err, 'error');
                                }
                            );
                    } else {
                        this.show_error = true;
                        this.error_message = `Please select buyer number(s) first!`;
                    }

                }
                if (this.selected_pub_settings.enable_inside_route || this.selected_pub_settings.number_to_ivr) {
                    if (data.inside_route != '') {
                        this.myservice.post('/Campaign/edit/' + this.edit_campaign_id, data)
                            .subscribe(
                                result => {
                                    if (result.success === 'OK') {
                                        this.router.navigate(['/campaign']);
                                    }
                                },
                                err => {
                                    console.log(err, 'error');
                                }
                            );
                    } else {
                        this.show_error = true;
                        this.error_message = `Please enter or select internal routing number first!`;
                    }
                }
            } else {
                this.show_error = true;
                this.error_message = `Please select TFN(s) first!`;
            }


        }
    }


}
