import { Component, OnInit, ViewChild, Input } from '@angular/core';

import { MatPaginator, MatSort, MatTableDataSource, MatCheckboxModule, MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { Router, NavigationEnd } from '@angular/router';
import { Observable } from 'rxjs';
import { routerTransition } from '../../router.animations';
import { CommonService } from '../../shared/services/common.service';
import { PublisherService } from '../../shared/services/publisher.service';

import { RealtimeService } from '../../shared/services/realtime.service';

@Component({
  selector: 'app-secondrealtime',
  templateUrl: './secondrealtime.component.html',
  styleUrls: ['./secondrealtime.component.scss'],
  animations: [routerTransition()]
})
export class SecondrealtimeComponent implements OnInit {

  pub_id;
  grid_deleted = false;
  error = false;
  filteredPublishers: Observable<any>;
  selected_tfn;
  selected_pub_id = '';
  realtime = [];
  loggedUser;
  loggedUserSettings;
  waitingcalls = [];
  panelOpenIndex = 0;
  intervalVar;
  intervalVar2;
  show_waiting = false;
  constructor(

    public dialog: MatDialog,
    public router: Router,
    private myService: CommonService,
    private publisherservice: PublisherService,
    private realTimeService: RealtimeService

  ) {
    this.loggedUser = JSON.parse(localStorage.getItem('user'));
    this.loggedUserSettings = JSON.parse(localStorage.getItem('userSettings'));
  }


  ngOnInit() {

    const that = this;
    this.intervalVar = setInterval(() => {
      that.getData();
    }, 5000);
    if (['admin', 'director'].indexOf(this.loggedUser.role) > -1) {
      this.show_waiting = true;
      this.intervalVar2 = setInterval(() => {
        that.getWaiting();
      }, 4000);
    }

  }

  ngOnDestroy() {
    // console.log('while leaving the destroy');
    clearInterval(this.intervalVar);
    clearInterval(this.intervalVar2);
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

    /*   if (this.loggedUser.role === 'publisher') {
        str += '&pub_id=' + this.loggedUser.uid;
      } */

    this.realTimeService.get(str)
      .subscribe(result => {
        let result2 = result;
        if (this.loggedUser.role === 'publisher') {
          result2 = this.publisher(result);
        }

        this.realtime = this.mergeArray(result2);
        // console.log(this.realtime);

      });
  }

  publisher(data) {
    return data.filter(value => {
      if (value.status === 'show' && parseInt(value.queue) === this.loggedUser.uid) {
        return true;
      }
    });
  }
  mergeArray(data) {
    let t = 0, mergeArr = [];
    for (let i = 0; i < data.length; i++) {

      if (data[i]['from_did'] > 0) {

        if (mergeArr[data[i]['queue']] === undefined) {
          t = 0;
          mergeArr[data[i]['queue']] = { publisher: data[i]['pub_name'], calls: {}, total: 0 };
        } else {
          t = mergeArr[data[i]['queue']].total;
        }
        const from_did = data[i]['from_did'].trim();
        if (!mergeArr[data[i]['queue']].calls.hasOwnProperty(from_did)) {
          mergeArr[data[i]['queue']].calls[from_did] = [];
        }
        mergeArr[data[i]['queue']].calls[from_did].push(data[i]);
        t++;
        mergeArr[data[i]['queue']].total = t;
      }
    }
    return mergeArr;
  }

  getWaiting() {
    this.realTimeService.get('https://portal.pbx4you.com/waitingcalls.php')
      .subscribe(result => {
        this.waitingcalls = result.waiting_calls;
      });
  }

}
