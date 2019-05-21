import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource, MatCheckboxModule, MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Router, NavigationEnd } from '@angular/router';

import { routerTransition } from '../../router.animations';

import { CommonService } from '../../shared/services/common.service';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { FlashMessagesService } from 'angular2-flash-messages';


@Component({
  selector: 'app-auditprofile',
  templateUrl: './auditprofile.component.html',
  styleUrls: ['./auditprofile.component.scss'],
  animations: [routerTransition()]
})

export class AuditprofileComponent implements OnInit {
  isLoading = true;
  users: any;
  dtOptions: any = {};
  dtTrigger = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  constructor(public dialog: MatDialog, public router: Router, private myservice: CommonService,
    private _flashMessagesService: FlashMessagesService) { }

  ngOnInit() {
    this.dtOptions = {
      pagingType: 'full_numbers',

      lengthMenu: [[20, 50, 200, -1], [20, 50, 200, 'All']],
      pageLength: 20,
      order: [[0, 'desc']],
      dom: 'Bfrtip',
      buttons: [
        {
          extend: 'copy',
          title: 'Audit Profiles'
        },
        {
          extend: 'print',
          title: 'Audit Profiles'
        },
        {
          extend: 'csv',
          title: 'Audit Profiles'
        },
        {
          extend: 'excel',
          title: 'Audit Profiles'
        }
      ],
      responsive: true,
    };

    this.myservice.get('/auditers/')
      .subscribe(data => {
        this.isLoading = false;
        this.users = data.user;
        this.dtTrigger.next();
      });
  }

  deleteAduit(uid) {

    if (confirm(`This functionality is pending. Are you sure to delete the audit profile?`)) {
      console.log('audit profile deleted');
      this.myservice.delete('/deleteAuditer/' + uid).subscribe(
        data => {
          if (data.success === 'OK') {
            this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
              // Destroy the table first
              const r = dtInstance.data();
              r.map((e, i) => {
                /* due to string and number comparison */
                if (e[0] == uid) {
                  dtInstance.row(i).remove();
                  dtInstance.draw();
                  this._flashMessagesService.show('Audit Profile is deleted successfully.',
                    { cssClass: 'alert-success', timeout: 3000 });
                }
              });
            });
          }
        },
        err => {
          console.log(err);
        });

    }
  }

}
