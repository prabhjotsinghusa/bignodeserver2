import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource, MatCheckboxModule, MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Router, NavigationEnd } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';

import { routerTransition } from '../../router.animations';
import { Tfn } from "../../shared/models/tfn";


import { CommonService } from '../../shared/services/common.service';

@Component({
  selector: 'app-tfns',
  templateUrl: './tfns.component.html',
  styleUrls: ['./tfns.component.scss'],
  animations: [routerTransition()]
})


export class TfnsComponent implements OnInit {
  loggedUser;
  loggedUserSettings;
  show_buttons = true;
  isLoading = true;
  displayedColumns: string[] = ['select', 'id', 'tfn', 'ip', 'publisherName', 'status', 'price_per_tfn', 'edit', 'permanent_delete',
    'pub_delete'];
  dataSource = new MatTableDataSource<Tfn>(ELEMENT_DATA);
  data = Object.assign(ELEMENT_DATA);
  selection = new SelectionModel<Tfn>(true, []);
  tfn_deleted = false;
  filters: any;
  deleted_msg = `The publisher is deleted successfully from the TFN`;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  tfns: Tfn[];

  constructor(public dialog: MatDialog, public router: Router, private myservice: CommonService) {
    this.loggedUser = JSON.parse(localStorage.getItem('user'));
    this.loggedUserSettings = JSON.parse(localStorage.getItem('userSettings'));
  }

  ngOnInit() {
    this.dataSource.paginator = this.paginator;
    if (this.loggedUser.role === 'publisher') {
      this.show_buttons = false;
      this.displayedColumns = ['id', 'tfn', 'status', 'price_per_tfn'];
      this.myservice.get('/getTfnByPublisher/' + this.loggedUser.uid)
        .subscribe(data2 => {
          this.data = data2.tfn;
          this.dataSource = new MatTableDataSource<Tfn>(data2.tfn);
          this.callafterload();
        });
    } else {
      this.myservice.get('/getAllTfns/')
        .subscribe(data2 => {
          this.data = data2.tfn;
          this.dataSource = new MatTableDataSource<Tfn>(data2.tfn);
          this.callafterload();
        });
    }
  }

  callafterload() {

    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.isLoading = false;
    if (this.filters) {
      this.dataSource.filter = this.filters;
    }
  }
  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.dataSource.filter = this.filters = filterValue;
  }

  deleteTFN(id, type) {
    this.deleted_msg = `The TFN is deleted successfully from the database`;
    if (type === 'publisher_remove') {
      if (confirm(`Are you sure to delete the publisher from the tfn?
      All information related to the campaign, buyer and buyer numbers will be deleted.`)) {
        let index = -1;
        this.dataSource.data.forEach((tfn, i) => {
          if (tfn['_id'] === id) {
            index = i;
          }
        });
        if (index > -1) {
          const temp = { pub_id: 0, status: 'available', purchase_date: '' };
          this.myservice.put('/updatePublisher/' + id, temp).subscribe(
            data => {
              if (data.tfn) {
                this.dataSource.data[index].pub_id = 0;
                this.dataSource.data[index].publisherName = '';
                this.dataSource.data[index].status = 'available';
                this.dataSource = new MatTableDataSource<Tfn>(this.dataSource.data);
                this.callafterload();
                this.tfn_deleted = true;
              }
            },
            err => {
              console.log(err);
            });
        }
      }

    }
    if (type === 'permanent_remove') {
      if (confirm(`Are you sure to delete the TFN from the database?
      All information related to the campaign, buyer and buyer numbers will be deleted.`)) {
        let index = -1;
        this.dataSource.data.forEach((tfn, i) => {
          if (tfn['_id'] === id) {
            index = i;
          }
        });
        if (index > -1) {
          this.myservice.delete('/tfn/delete/' + id).subscribe(
            res => {
              if (res.success === 'OK') {
                this.dataSource.data.splice(index, 1);
                this.dataSource = new MatTableDataSource<Tfn>(this.dataSource.data);
                this.callafterload();
                this.deleted_msg = res.message;
                this.tfn_deleted = true;
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

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  massAction(type) {
    if (this.selection.selected.length > 0) {
      if (confirm(`Are you sure to delete the publisher from the selected tfn(s)?
      All information related to the campaign, buyer and buyer numbers will be deleted.`)) {
        this.selection.selected.forEach(async (item) => {
          let temp = {};
          if (type === 'publisher_remove') {
            temp = { pub_id: 0, status: 'available', purchase_date: '' };
            this.myservice.put('/updatePublisher/' + item._id, temp).subscribe(
              data => {
                if (data.tfn) {
                  const index: number = this.data.findIndex(d => d === item);
                  // console.log(this.data.findIndex(d => d === item));
                  this.dataSource.data[index].pub_id = 0;
                  this.dataSource.data[index].publisherName = '';
                  this.dataSource.data[index].status = 'available';
                  this.deleted_msg = `The publisher(s) are deleted successfully from the selected TFN.`;
                  this.dataSource = new MatTableDataSource<Tfn>(this.dataSource.data);
                  this.callafterload();
                  this.tfn_deleted = true;
                }
              },
              err => {
                console.log(err);
              });
          }
          if (type === 'permanent_remove') {
            this.myservice.delete('/tfn/delete/' + item._id).subscribe(
              res => {
                const index: number = this.data.findIndex(d => d === item);
                if (res.success === 'OK') {
                  this.dataSource.data.splice(index, 1);
                  // this.dataSource = new MatTableDataSource<Tfn>(this.dataSource.data);
                  this.deleted_msg = `The TFN(s) are deleted successfully from the database.`;
                  this.dataSource = new MatTableDataSource<Tfn>(this.dataSource.data);
                  this.callafterload();
                  this.tfn_deleted = true;
                }
              },
              err => {
                console.log(err);
              });
          }
        });

        this.selection = new SelectionModel<Tfn>(true, []);
      }
    } else {
      alert(`Please select a checkbox first!`);
    }
  }

  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }
}
const ELEMENT_DATA: Tfn[] = [];
