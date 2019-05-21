import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource, MatCheckboxModule, MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';

import { routerTransition } from '../../router.animations';
import { User } from "../../shared/models/user";


import { CommonService } from '../../shared/services/common.service';

@Component({
  selector: 'app-managegroup',
  templateUrl: './managegroup.component.html',
  styleUrls: ['./managegroup.component.scss'],
  animations: [routerTransition()]
})

export class ManagegroupComponent implements OnInit {
  displayedColumns: string[] = ['gid', 'name', 'status', 'createdAt', 'edit'];
  dataSource = new MatTableDataSource<any>(ELEMENT_DATA);

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  group_deleted = false;
  constructor(public dialog: MatDialog, public router: Router, private myservice: CommonService) { }

  ngOnInit() {
    this.dataSource.paginator = this.paginator;

    this.myservice.get('/group/getAll/')
      .subscribe(data => {
        this.dataSource = new MatTableDataSource<any>(data.groups);
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

  deleteGroup(gid) {
    if (confirm(`This functionality is pending. Are you sure to delete the group?`)) {
      let index = -1;
      this.dataSource.data.forEach((grp, i) => {
        if (grp.gid === gid) {
          index = i;
        }
      });
      if (index > -1) {
        this.myservice.delete('/group/deleteGroup/' + parseInt(gid)).subscribe(
          data => {
            if (data.statusCode === 200) {
              this.dataSource.data.splice(index, 1);
              this.dataSource = new MatTableDataSource<any>(this.dataSource.data);
              this.callafterload();
              this.group_deleted = true;
            }
          },
          err => {
            console.log(err);
          });
      }
    }
  }

}
const ELEMENT_DATA: any[] = [];
