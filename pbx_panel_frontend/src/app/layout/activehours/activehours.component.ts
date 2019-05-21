import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource, MatCheckboxModule, MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Router, NavigationEnd } from '@angular/router';

import { routerTransition } from '../../router.animations';
import { Activehour } from "../../shared/models/activehour";

import { CommonService } from '../../shared/services/common.service';

@Component({
  selector: 'app-activehours',
  templateUrl: './activehours.component.html',
  styleUrls: ['./activehours.component.scss'],
  animations: [routerTransition()]
})

export class ActivehoursComponent implements OnInit {
  displayedColumns: string[] = ['day', 'tfn', 'destination', 'active_on', 'active_off', 'edit'];
  dataSource = new MatTableDataSource<Activehour>(ELEMENT_DATA);

  grid_deleted = false;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  activehours: Activehour[];

  constructor(public dialog: MatDialog, public router: Router, private myservice: CommonService) { }

  ngOnInit() {
    this.dataSource.paginator = this.paginator;

    this.myservice.get('/ActiveHours/getAll/')
      .subscribe(data => {
        this.dataSource = new MatTableDataSource<Activehour>(data.activeHours);
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

  deleteActivehour(id) {
    if (confirm(`Are you sure to delete this active hour?`)) {
      let index = -1;
      this.dataSource.data.forEach((activehour, i) => {
        if (activehour['_id'] == id) {
          index = i;
        }
      });
      console.log(id);
      if (index > -1) {
        this.myservice.delete('/ActiveHours/delete/' + id).subscribe(
          data => {
            if (data.success == "OK") {
              this.dataSource.data.splice(index, 1);
              this.dataSource = new MatTableDataSource<Activehour>(this.dataSource.data);
              this.callafterload();
              this.grid_deleted = true;
            }
          },
          err => {
            console.log(err);
          });
      } else {
        alert(`There is some error while deleting the active hour.`);
      }
    }
  }

}
const ELEMENT_DATA: Activehour[] = [];
