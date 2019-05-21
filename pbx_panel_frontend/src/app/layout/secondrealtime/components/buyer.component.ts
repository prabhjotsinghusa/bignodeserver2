import { Component, OnInit, ViewChild, Input } from '@angular/core';
import {
    MatPaginator, MatSort, MatTableDataSource, MatCheckboxModule, MatDialog,
    MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA
} from '@angular/material';
import { Router, NavigationEnd } from '@angular/router';
import { Observable } from 'rxjs';

import { routerTransition } from '../../../router.animations';

import { CommonService } from '../../../shared/services/common.service';

import { RealtimeService } from '../../../shared/services/realtime.service';
import { forkJoin } from 'rxjs';

@Component({

    selector: 'app-buyer',
    templateUrl: './buyer.component.html',
    styleUrls: ['./common.component.scss'],
    animations: [routerTransition()]

})
export class BuyerComponent implements OnInit {

    realtime = [];
    loggedUser: any;
    loggedUserSettings: any;
    waitingcalls = [];
    panelOpenState = 0;
    intervalVar;
    intervalVar2;
    show_waiting = false;
    constructor(public dialog: MatDialog, public router: Router, private myservice: CommonService,
        private realtimeservice: RealtimeService) {
        this.loggedUser = JSON.parse(localStorage.getItem('user'));
        this.loggedUserSettings = JSON.parse(localStorage.getItem('userSettings'));
    }
    totalcalls = {};
    totaluniqueansweredcalls = {};
    AHT = {};
    ngOnInit() {
        const that = this;
        this.intervalVar = setInterval(() => {
            that.getData();
        }, 6000);
        if (['admin', 'director'].indexOf(this.loggedUser.role) > -1) {
            this.show_waiting = true;
            this.intervalVar2 = setInterval(() => {
                that.getWaiting();
            }, 5000);
        }
    }
    ngOnDestroy() {
        // console.log('while leaving the destroy');
        clearInterval(this.intervalVar);
        clearInterval(this.intervalVar2);
    }

    getData() {
        let str = 'https://client.pbx4you.com:8444/realtime/getBuyer2';

        if (this.loggedUser.role === 'buyer') {
            str = 'https://client.pbx4you.com:8444/realtime/specificBuyer?buyer_id=' + this.loggedUser.buyer_id;
        }

        this.realtimeservice.get(str).subscribe(res => {
            this.realtime = res.data;
            this.realtime.forEach(data => {
                if (data.dynamic) {
                    data.calls.forEach(element => {
                        if (element != null) {
                            element.value.map(obj => {

                               this.getBuyerCalls([obj.buyer_number]);

                            });

                        }
                    });
                }

            });
        });

    }

    getBuyerCalls(buyerNumberArr) {

        this.concatMultipleServices(buyerNumberArr).subscribe(data => {
            this.realtime.forEach(value => {
                value.calls.forEach(element => {
                    if (element != null) {
                        const bb = buyerNumberArr[0];
                        this.totalcalls[bb] = data[0].totalcalls;
                        this.totaluniqueansweredcalls[bb] = data[1].totaluniqueansweredcalls;
                        this.AHT[bb] = data[2].aht[0] ? Math.ceil(data[2].aht[0].aht / 60) : 0;
                    }
                });
            });
        });

    }

    concatMultipleServices(buyerNumberArr) {
        let url1 = `https://client.pbx4you.com:8444/getTotalCalls?buyerNumber=` + JSON.stringify(buyerNumberArr);
        // let url2 = `/getTotalUniquieCalls?buyerNumber=${buyerNumberArr}`;
        let url3 = `https://client.pbx4you.com:8444/getTotalUniqueAnsweredCalls?buyerNumber=` + JSON.stringify(buyerNumberArr);
        let url4 = `https://client.pbx4you.com:8444/getAHT?buyerNumber=` + JSON.stringify(buyerNumberArr);
        //return this.http.get(url);
        return forkJoin(
            this.realtimeservice.get(url1),
            //  this.myservice.get(url2),
            this.realtimeservice.get(url3),
            this.realtimeservice.get(url4)
        );
    }
    getWaiting() {
        this.realtimeservice.get('https://portal.pbx4you.com/waitingcalls.php')
            .subscribe(result => {
                this.waitingcalls = result.waiting_calls;
            });
    }

}
