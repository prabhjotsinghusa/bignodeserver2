import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { MatCheckboxModule, MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Router, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';

import { routerTransition } from '../../router.animations';

import { CommonService } from '../../shared/services/common.service';
import { FlashMessagesService } from 'angular2-flash-messages';


@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
  animations: [routerTransition()]
})

export class UsersComponent implements OnInit {
  isLoading = true;
  publishers: any;
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
          title: 'Publishers'
        },
        {
          extend: 'print',
          title: 'Publishers'
        },
        {
          extend: 'csv',
          title: 'Publishers'
        },
        {
          extend: 'excel',
          title: 'Publishers'
        }
      ],
      responsive: true,
    };
    this.myservice.get('/publisher/getPublishers/')
      .subscribe(data => {
        this.isLoading = false;
        this.publishers = data.user;
        this.dtTrigger.next();
      });

  }
  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }


  deletePublisher(uid) {
    if (confirm(`Are you sure to delete the publisher?`)) {
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        // Destroy the table first
        const r = dtInstance.data();
        r.map((e, i) => {
          /* due to string and number comparison */
          if (e[0] == uid) {
            dtInstance.row(i).remove();
            dtInstance.draw();
            this.myservice.put('/publisher/deletePublisher/' + uid).subscribe(
              data => {
                if (data.user) {
                  // this.router.navigate(['/users']);
                  this._flashMessagesService.show('Publisher is deleted successfully.',
                    { cssClass: 'alert-success', timeout: 3000 });
                }
              },
              err => {
                console.log(err);
              });
          }
        });
      });
    }
  }

}

