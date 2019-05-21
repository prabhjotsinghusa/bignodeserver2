import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource, MatCheckboxModule, MatDialog,
   MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Router, NavigationEnd } from '@angular/router';


import { routerTransition } from '../../../router.animations';
import { Tfn } from '../../../shared/models/tfn';


import { CommonService } from '../../../shared/services/common.service';


@Component({
  selector: 'app-pendingtfns',
  templateUrl: './pendingtfns.component.html',
  styleUrls: ['./tfns.component.scss'],
  animations: [routerTransition()]
})


export class PendingtfnsComponent implements OnInit {
  displayedColumns: string[] = ['id', 'tfn', 'publisherName', 'purchase_date', 'status', 'price_per_tfn', 'edit'];
  dataSource = new MatTableDataSource<Tfn>(ELEMENT_DATA);
  data = Object.assign(ELEMENT_DATA);
  isLoading = true;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  tfns: Tfn[];
  tfn_declined = false;
  common_msg = `The TFN is approved successfully`;
  constructor(public dialog: MatDialog, public router: Router, private myservice: CommonService) { }

  ngOnInit() {
    this.dataSource.paginator = this.paginator;

    this.myservice.get('/getPendingTfns/')
      .subscribe(data2 => {
        this.data = data2.tfn;
        this.dataSource = new MatTableDataSource<Tfn>(data2.tfn);
        this.callafterload();
      });
  }


  callafterload() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.isLoading = false;
  }
  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }

  approveTFN(id, type) {
    this.common_msg = `The publisher is deleted successfully from the TFN`;
    if (confirm(`Are you sure to ` + type + ` the tfn?`)) {
      let temp: any = {};
      let index = -1;
      this.dataSource.data.forEach((tfn, i) => {
        if (tfn['_id'] === id) {
          index = i;
        }
      });
      if (type === 'approve') {
        console.log('related item delete functionality is pending in tfn');
        temp = { status: 'unused' };
        this.common_msg = `The TFN is approved.`;
      }
      if (type === 'decline') {
        console.log('related item delete functionality is pending in tfn');
        temp = { status: 'available', pub_id: 0 };
        this.common_msg = `The TFN is declined.`;
      }
      if (index > -1) {
        console.log('related item delete functionality is pending in tfn');
        this.myservice.put('/updatePublisher/' + id, temp).subscribe(
          data => {
            if (data.tfn) {
              this.dataSource.data.splice(index, 1);
              this.dataSource = new MatTableDataSource<Tfn>(this.dataSource.data);
              this.callafterload();
              this.tfn_declined = true;
            }
          },
          err => {
            console.log(err);
          });
      } else {
        alert(`There is some error while deleting the tfn.`);
      }
    }
  }
}
const ELEMENT_DATA: Tfn[] = [];
