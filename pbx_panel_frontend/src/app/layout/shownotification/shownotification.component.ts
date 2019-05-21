import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource, MatCheckboxModule, MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Router, NavigationEnd } from '@angular/router';

import { routerTransition } from '../../router.animations';
import { PaymentNotification } from "../../shared/models/paymentnotification";

import { CommonService } from '../../shared/services/common.service';

@Component({
  selector: 'app-shownotification',
  templateUrl: './shownotification.component.html',
  styleUrls: ['./shownotification.component.scss'],
  animations: [routerTransition()]
})

export class ShownotificationComponent implements OnInit {
  displayedColumns: string[] = ['publisherName', 'status', 'edit'];
  dataSource = new MatTableDataSource<PaymentNotification>(ELEMENT_DATA);

  grid_deleted = false;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  shownotification: PaymentNotification[];

  constructor(public dialog: MatDialog, public router: Router, private myservice: CommonService) { }

  ngOnInit() {
    this.dataSource.paginator = this.paginator;

    this.myservice.get('/payment_notification/getAll/?status=1/')
      .subscribe(data => {
        this.dataSource = new MatTableDataSource<PaymentNotification>(data.paymentnotification);
        this.callafterload();
      });
  }

  callafterload() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }

}
const ELEMENT_DATA: PaymentNotification[] = [];
