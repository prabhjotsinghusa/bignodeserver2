import { Component, OnInit } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource, MatCheckboxModule, MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { NavigationEnd, Router, ActivatedRoute } from '@angular/router';
import { NgDateRangePickerOptions } from 'ng-daterangepicker';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs';
import { switchMap, debounceTime } from 'rxjs/operators';
import { Subscription } from 'rxjs/Subscription';

import { DataTableDirective } from 'angular-datatables';
import { routerTransition } from '../../router.animations';
import { Cdr } from "../../shared/models/cdr";

import { CommonService } from '../../shared/services/common.service';
import { PublisherService } from '../../shared/services/publisher.service';
import { CampService } from '../../shared/services/camp.service';
import { RealtimeService } from '../../shared/services/realtime.service';

@Component({
  selector: 'app-buyermonitoring',
  templateUrl: './buyermonitoring.component.html',
  styleUrls: ['./buyermonitoring.component.scss'],
  animations: [routerTransition()]
})
export class BuyermonitoringComponent implements OnInit {
  loggedUser;
  loggedUserSettings;
  realtime:any = [];
  offlineextcount = 0;
  onlineextcount = 0;
  intervalVar;
  buyerSub;
  queue;
  str;
  constructor(public dialog: MatDialog,
    public router: Router,
    private myService: CommonService,
    private publisherservice: PublisherService,
    private realTimeService: RealtimeService,
    private activeRoute: ActivatedRoute
  ) {
    this.loggedUser = JSON.parse(localStorage.getItem('user'));
    this.loggedUserSettings = JSON.parse(localStorage.getItem('userSettings'));
  }

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
  getData() {
    this.str = 'https://portal.pbx4you.com/monitoring/queue_monitoring.php?';
    this.buyerSub = this.activeRoute.params.subscribe(params => {

      if (params.queue) {

        this.str += 'queue=' + params.queue + '&qname=' + params.qname;
      }
    });
    let str = this.str;
    this.realTimeService.get(str).subscribe(data => {
      this.realtime = data;
      if (data.offline !== undefined) {
        this.offlineextcount = data.offline.length;
      }
      if (data.online !== undefined) {
        this.onlineextcount = data.online.length;
      }
    });

  }

}
