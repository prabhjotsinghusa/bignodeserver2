import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { switchMap, debounceTime } from 'rxjs/operators';
import { NgbModal, ModalDismissReasons, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { routerTransition } from '../../../router.animations';
import { CommonService } from '../../../shared/services/common.service';
import { PublisherService } from '../../../shared/services/publisher.service';


@Component({
    selector: 'app-addtfn',
    templateUrl: './addtfn.component.html',
    styleUrls: ['./common.component.scss'],
    animations: [routerTransition()]
})
export class AddtfnComponent implements OnInit {
    loggedUser;
    formdata;
    error = false;
    error2 = false;
    isLoading = false;
    show_error = false;
    error_message = ``;

    filteredPublishers: Observable<any>;
    selected_pub = { uid: 0, fullname: '' };
    optionsArr = [{ key: 0, value: 'Disable' }, { key: 1, value: 'Enable' }];

    closeResult: string;
    modalReference: NgbModalRef;

    constructor(public router: Router, private myservice: CommonService, private publisherservice: PublisherService,
        private modalService: NgbModal) {
        this.loggedUser = JSON.parse(localStorage.getItem('user'));
    }

    ngOnInit() {
        this.formdata = new FormGroup({
            camp_name: new FormControl('', Validators.compose([
                Validators.required,
                Validators.minLength(4),
            ])),
            buffer_time: new FormControl('', Validators.compose([
                Validators.required,
                Validators.minLength(1),
            ])),
            price_per_call: new FormControl('', Validators.compose([
                Validators.required,
                Validators.minLength(1),
            ])),
            time_zone: new FormControl('CST'),
            pub_id: new FormControl('', Validators.required),
            read_only: new FormControl(0),
        });
        this.filteredPublishers = this.formdata.get('pub_id').valueChanges.pipe(
            debounceTime(200),
            switchMap(value => this.publisherservice.search(value))
        );
        /* for publisher logged account */
        if (this.loggedUser.role === 'publisher') {
            this.selected_pub = this.loggedUser;
            this.formdata.patchValue({
                pub_id: this.selected_pub.uid
            });
        }
    }
    hideLoader() {
        this.isLoading = false;
        if (this.formdata.get('pub_id').value) {
            console.log(this.selected_pub.uid);
        }

    }
    showLoader() {
        this.isLoading = true;
    }

    displayFn(publisher) {
        if (publisher) { return publisher.fullname; }
    }

    addCampaign() {
        this.error = false;
        if (this.formdata.invalid) {
            this.error = true;
        } else {
            const data = this.formdata.value;
            console.log(data, 'campaign data')
            /*   this.myservice.post('/Campaign/add', data)
                              .subscribe(
                                  result => {
                                      if (result.success === 'OK') {
                                          this.router.navigate(['/campaign']);
                                      }
                                  },
                                  err => {
                                      console.log(err, 'error');
                                  }
                              ); */



        }

    }
}
