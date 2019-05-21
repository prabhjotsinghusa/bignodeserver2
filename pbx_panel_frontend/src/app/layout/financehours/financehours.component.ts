
import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource, MatCheckboxModule, MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Router, NavigationEnd } from '@angular/router';
import { routerTransition } from '../../router.animations';
import { FinanceHour } from "../../shared/models/financehour";
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CommonService } from '../../shared/services/common.service';
import * as moment from 'moment';
@Component({
  selector: 'app-financehours',
  templateUrl: './financehours.component.html',
  styleUrls: ['./financehours.component.scss'],
  animations: [routerTransition()]
})
export class FinanceHoursComponent implements OnInit {
  displayedColumns: string[] = ['fh_id', 'publisherName', 'enable_from', 'enable_till', 'action'];
  dataSource = new MatTableDataSource<FinanceHour>(ELEMENT_DATA);

  formdata:any;
  isLoading = true;
  grid_deleted = false;
  resultsLength = 0;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  financehours: FinanceHour[];

  constructor(public dialog: MatDialog, public router: Router, private myservice: CommonService) { }

  ngOnInit() {

    this.dataSource.paginator = this.paginator;
    this.formdata = new FormGroup({
      pub_id: new FormControl(''),
      daterange: new FormControl(''),
      camp_id: new FormControl('')
    });

    const data = this.formdata.value;

    let query = '/getFinanceHours?';

    if (data.limit) {
      query += "&limit=" + data.limit;
    } else {
      query += "&limit=20";
    }

    if (data.page) {
      query += "&page =" + data.page;
    } else {
      query += "&page=1";
    }
    this.myservice.get(query)
      .subscribe(data => {
        this.isLoading = false;
        this.resultsLength = data.count;
        this.dataSource = new MatTableDataSource<FinanceHour>(data.financeHour);
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
  displayFn(publisher) {
    if (publisher) { return publisher.fullname; }
  }

  deleteFinanceHour(id) {
    if (confirm(`Are you sure to delete this finance hour?`)) {
      let index = -1;
      this.dataSource.data.forEach((fhrs, i) => {
        if (fhrs.fh_id == id) {
          index = i;
        }
      });
      console.log(id);
      if (index > -1) {
        this.myservice.delete('/deleteFinanceHours/' + id).subscribe(
          data => {
            if (data.success == "OK") {
              this.dataSource.data.splice(index, 1);
              this.dataSource = new MatTableDataSource<FinanceHour>(this.dataSource.data);
              this.callafterload();
              this.grid_deleted = true;
            }
          },
          err => {
            console.log(err);
          });
      } else {
        alert(`There is some error while deleting the finance hour.`);
      }
    }
  }

}

const ELEMENT_DATA: FinanceHour[] = [];
