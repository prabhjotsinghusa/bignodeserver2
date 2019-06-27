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
    selector: 'app-addtfn',
    templateUrl: './addtfn.component.html',
    styleUrls: ['./common.component.scss'],
    animations: [routerTransition()]
})
export class AddtfnComponent implements OnInit {
    loggedUser;
    formdata;
    edit_id = 0;
    error = false;
    error2 = false;
    isLoading = false;
    show_error = false;
    error_message = ``;

    selected_campaign: any;
    selected_publisher = 0;
    selected_pub_settings: any;
    pub_tfn: any;
    selected_tfns: any = [];
    closeResult: string;
    modalReference: NgbModalRef;

    source: any = [];
    format = {
        add: 'Available TFN(s)', remove: 'Selected TFN(s)', all: 'All', none: 'None',
        direction: 'left-to-right', draggable: true, locale: 'en'
    };
    confirmed: any = [];
    constructor(public router: Router, private activeroute: ActivatedRoute, private myservice: CommonService, private publisherservice: PublisherService,
        private modalService: NgbModal) {
        this.loggedUser = JSON.parse(localStorage.getItem('user'));
        this.activeroute.params.subscribe(params => {
            this.edit_id = params.id;
        });
    }

    ngOnInit() {
        this.myservice.get('/Campaign/getCampaignByCampaignId/' + this.edit_id).subscribe(res => {
            this.selected_campaign = res.campaigns[0];
            this.selected_publisher = this.selected_campaign.pub_id;
            /* for publisher logged account */
            if (this.loggedUser.role === 'publisher' && this.selected_publisher !== this.loggedUser.uid) {
                this.router.navigate(['/campaigns']);
            }
            this.myservice.get('/publisher/getPublisherSettings/' + this.selected_publisher).subscribe(data => {
                this.selected_pub_settings = data.settings;
            });

            /* Get all tfn of the publisher */
            this.myservice.get('/getTfnByPublisher/' + this.selected_publisher).subscribe(
                data => {
                    this.pub_tfn = data.tfn;
                    this.selected_tfns = [];
                    this.source = data.tfn.filter(d => !(d.status === 'used' || d.status === 'pending'));
                }, err => {
                    console.log(err);
                }
            );

        });
    }

    addTFN() {
        this.show_error = false;
        if (this.confirmed.length < 1) {
            this.show_error = true;
            this.error_message = `Select a TFN(s) in campaign first!`;
        } else {
            
            const data = { tfns: this.confirmed, pub_id:this.selected_publisher, camp_id: this.selected_campaign.campaign_id };
            console.log(data, 'campaign data');
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
