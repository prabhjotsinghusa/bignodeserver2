import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource, MatCheckboxModule, MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Router, NavigationEnd } from '@angular/router';
import { Observable } from 'rxjs';

import { routerTransition } from '../../../router.animations';

import { CommonService } from '../../../shared/services/common.service';
import { PublisherService } from '../../../shared/services/publisher.service';
import { RealtimeService } from '../../../shared/services/realtime.service';



@Component({
  selector: 'app-commoncalls',
  templateUrl: './commoncalls.component.html',
  styleUrls: ['./common.component.scss'],
  animations: [routerTransition()]
})
export class CommoncallsComponent implements OnInit {

  pub_id;
  filteredPublishers: Observable<any>;
  selected_tfn;
  selected_pub_id = '';
  realtime = [];
  realtime2 = [];
  waitingcalls = [];
  loggedUser: any;
  loggedUserSettings: any;

  panelOpenState = 0;
  panelOpenState2 = 0;
  intervalVar;
  intervalVar2;
  show_waiting = false;

  constructor(public dialog: MatDialog, public router: Router, private myservice: CommonService,
    private publisherservice: PublisherService, private realtimeService: RealtimeService) {
    this.loggedUser = JSON.parse(localStorage.getItem('user'));
    this.loggedUserSettings = JSON.parse(localStorage.getItem('userSettings'));
  }

  ngOnInit() {
    const roleAccess = ['admin', 'director'];
    if (roleAccess.indexOf(this.loggedUser.role) === -1) {
      this.router.navigate(['/dashboard']);
    }
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

    if (this.loggedUser.role === 'publisher') {
      str += '&pub_id=' + this.loggedUser.uid;
    }

    this.realtimeService.get(str)
      .subscribe(result => {
        this.realtime = this.mergeArray(result);
      });

    this.realtimeService.get('https://client.pbx4you.com:8444/realtime/getBuyer2').subscribe(res => {
      this.realtime2 = res.data;
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

  }



  getWaiting() {
    this.realtimeService.get('https://portal.pbx4you.com/waitingcalls.php')
      .subscribe(result => {
        this.waitingcalls = result.waiting_calls;
      });
  }

}
