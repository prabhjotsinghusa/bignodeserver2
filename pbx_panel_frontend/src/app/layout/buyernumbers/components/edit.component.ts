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
    loggedUser;
    loggedUserSettings;
    constructor(public router: Router, private activeroute: ActivatedRoute, private myservice: CommonService) { 
        this.loggedUser = JSON.parse(localStorage.getItem('user'));
        this.loggedUserSettings = JSON.parse(localStorage.getItem('userSettings'));
    }
    formdata;
    error: boolean = false;
    success_msg: boolean = false;
    show_error: boolean = false;
    error_message = ``;
    edit_id = 0;
    formdata2;
    edit_buyer_id;

    status:boolean = true;
    ngOnInit() {
        this.formdata = new FormGroup({
           
           // buyer_number: new FormControl({ value: '', disabled: true }),
           // buyer_name: new FormControl({ value: '', disabled: true }),
            display_wallet: new FormControl(0),
            usage_module: new FormControl(0),
            cdr_module: new FormControl(0),
            realtime_module: new FormControl(0),
            capping_module: new FormControl(0),
            wallet_module: new FormControl(0),
            monitoring_module: new FormControl(0),
            queue_module: new FormControl(0),
            //agent: new FormControl('', Validators.required),
            agent: new FormControl({ value: '', disabled: false }),
        });
        
        /* get url variables */
        this.activeroute.params.subscribe(params => {
           
            this.edit_buyer_id = params.id;

        });
       
        this.myservice.get('/BuyerNumbers/getBuyerNumberSettings/' + this.edit_buyer_id).subscribe(
            data => {
               
                const buyer = data.buyer;
                if(buyer.queue==0){
                    this.status = false;
                }
                this.formdata.patchValue({
                    wallet_module: buyer.buyer_finance,
                    cdr_module: buyer.cdr,
                    realtime_module: buyer.realtime,
                    capping_module: buyer.capping,
                    monitoring_module: buyer.monitoring,
                    queue_module: buyer.queue,
                    agent: buyer.agents

                });
               
            },
            err => {
                console.log(err);
            }
        );
        
        
    }
    save() {
        this.error = false;
        if (this.formdata.invalid) {
            this.error = true;
        } 
        else if((this.formdata.value.queue_module==1) && (this.formdata.value.agent=='') ){
            this.error = true;
        }
        else {
            let data = this.formdata.value;
           // console.log(data);
            
           this.myservice
                    .post('/buyerNumbers/updateBuyerNumberSettings/' + this.edit_buyer_id, data)
                    .subscribe(
                        data => {
                            //console.log(data);
                            if (data) {
                                this.router.navigate(['/buyernumbers']);
                            }
                        },
                        err => {
                            console.log(err, 'error');
                        }
            );
        }
       
    }
   
    toggle(event){
        var status=event.target.value;
        if(status==1){
            this.status= true;
        }
        else{
            this.status= false;
        }
       // console.log(this.status);
    }

}
