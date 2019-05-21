import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource, MatCheckboxModule, MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Router, NavigationEnd } from '@angular/router';
import { Observable } from 'rxjs';

import { routerTransition } from '../../../router.animations';

import { CommonService } from '../../../shared/services/common.service';//shared/services/common.service';
import { PublisherService } from '../../../shared/services/publisher.service';
import { RealtimeService } from '../../../shared/services/realtime.service';

@Component({
    selector: 'app-publisher',
    templateUrl: './publisher.component.html',
    styleUrls: ['./common.component.scss'],
    animations: [routerTransition()]
})
export class PublisherComponent implements OnInit {

    displayedColumns: string[] = ['tfn', 'takingTo', 'duration', 'extension'];
    pub_id;
    grid_deleted = false;
    error = false;
    filteredPublishers: Observable<any>;
    selected_tfn;
    selected_pub_id = '';
    realtime = [];
    loggedUser;
    loggedUserSettings;
    panelOpenState = 0;
    constructor(public dialog: MatDialog, public router: Router, private myservice: CommonService,
        private publisherservice: PublisherService, private realTimeService: RealtimeService) {
        this.loggedUser = JSON.parse(localStorage.getItem('user'));
        this.loggedUserSettings = JSON.parse(localStorage.getItem('userSettings'));
    }
    intervalVar;

    ngOnInit() {

        const that = this;
        this.intervalVar = setInterval(() => {
            that.getData();
        }, 5000);

    }
    ngOnDestroy() {

        // console.log('while leaving the destroy');
        clearInterval(this.intervalVar);
    }
    getRealtime(tfn, pub_id) {

        if (tfn !== '') {
            this.selected_tfn = tfn;
        } else {
            this.selected_tfn = '';
        }
        if (pub_id !== '') {
            this.selected_pub_id = pub_id;
        } else {
            this.selected_pub_id = '';
        }
        this.getData();
    }


    getData() {

        let str = 'https://portal.pbx4you.com/realtime.php?hasher=U3VjY2Vzcw';

        if (this.selected_pub_id !== undefined && this.selected_pub_id !== '') {
            str += '&publisher=' + this.selected_pub_id;
        }
        if (this.selected_tfn !== undefined && this.selected_tfn !== '') {
            str += '&tfn=' + this.selected_tfn;
        }
        // if (this.loggedUser.role === 'publisher') {
        //     str += '&pub_id=' + this.loggedUser.uid;
        // }
        this.realTimeService.get(str)
            .subscribe(result => {

                let result2 = result;
                result2 = this.filterpublisher(result);

                this.realtime = this.mergeArray(result2);

            });
    }

    filterpublisher(data) {
        return data.filter(value => {
            if (value.status === 'hide') {
                return true;
            }
        });
    }


    mergeArray(data) {
        // return new Promise((resolve, reject) => {
        let t = 0, mergeArr = [];
        for (let i = 0; i < data.length; i++) {

            if (data[i]['from_did'] > 0) {

                if (mergeArr[data[i]['queue']] === undefined) {
                    t = 0;
                    mergeArr[data[i]['queue']] = { publisher: data[i]['pub_name'], calls: {}, total: 0 };
                } else {

                    t = mergeArr[data[i]['queue']].total;
                }
                if (!mergeArr[data[i]['queue']].calls.hasOwnProperty(data[i]['from_did'])) {
                    mergeArr[data[i]['queue']].calls[data[i]['from_did']] = [];
                    mergeArr[data[i]['queue']].calls[data[i]['from_did']].push(data[i]);
                } else {
                    mergeArr[data[i]['queue']].calls[data[i]['from_did']].push(data[i]);
                }
                t++;
                mergeArr[data[i]['queue']].total = t;
            }
        }
        return mergeArr;
        // });
    }
}
