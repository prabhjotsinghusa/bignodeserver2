import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource, MatCheckboxModule, MatDialog,
  MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Router, NavigationEnd } from '@angular/router';

import { routerTransition } from '../../router.animations';
import { Campaign } from '../../shared/models/campaign';

import { CommonService } from '../../shared/services/common.service';

@Component({
  selector: 'app-campaign',
  templateUrl: './campaign.component.html',
  styleUrls: ['./campaign.component.scss'],
  animations: [routerTransition()]
})

export class CampaignComponent implements OnInit {
  displayedColumns: string[] = ['id', 'camp_name', 'publisherName', 'time_zone', 'price_per_call',
  'buffer_time', 'created_at', 'status', 'edit'];
  dataSource = new MatTableDataSource<Campaign>(ELEMENT_DATA);

  grid_deleted = false;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  campaign: Campaign[];
  loggedUser;
  loggedUserSettings;
  constructor(public dialog: MatDialog, public router: Router, private myservice: CommonService) {
    this.loggedUser = JSON.parse(localStorage.getItem('user'));
    this.loggedUserSettings = JSON.parse(localStorage.getItem('userSettings'));
  }

  ngOnInit() {
    this.dataSource.paginator = this.paginator;
    if (this.loggedUser.role === 'publisher') {
      this.displayedColumns = ['id', 'camp_name', 'time_zone', 'price_per_call', 'buffer_time', 'created_at', 'status', 'edit'];
      this.myservice.get('/Campaign/getCamp/' + this.loggedUser.uid)
        .subscribe(data => {
          this.dataSource = new MatTableDataSource<Campaign>(data.campaigns);
          this.callafterload();
        });
    } else if (this.loggedUser.role === 'admin') {
      this.myservice.get('/Campaign/getAll/')
        .subscribe(data => {
          this.dataSource = new MatTableDataSource<Campaign>(data.campaigns);
          this.callafterload();
        });
    } else {
      this.router.navigate(['/access-denied']);
    }
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

  deleteCampaign(id) {
    if (confirm(`All data related to this campaign will be deleted. Are you sure to delete this campaign?`)) {
      let index = -1;
      this.dataSource.data.forEach((camp, i) => {
        if (camp.campaign_id === id) {
          index = i;
        }
      });

      if (index > -1) {
        this.myservice.delete('/Campaign/delete/' + id).subscribe(
          data => {
            if (data.success === 'OK') {
              this.dataSource.data.splice(index, 1);
              this.dataSource = new MatTableDataSource<Campaign>(this.dataSource.data);
              this.callafterload();
              this.grid_deleted = true;
            }
          },
          err => {
            console.log(err);
          });
      } else {
        alert(`There is some error while deleting the campaign.`);
      }
    }
  }

}
const ELEMENT_DATA: Campaign[] = [];
