import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { MatCheckboxModule, MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Router, NavigationEnd } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';

import { routerTransition } from '../../router.animations';

import { CommonService } from '../../shared/services/common.service';
import { FlashMessagesService } from 'angular2-flash-messages';


@Component({
  selector: 'app-buyers',
  templateUrl: './buyers.component.html',
  styleUrls: ['./buyers.component.scss'],
  animations: [routerTransition()]
})

export class BuyersComponent implements OnInit {
  isLoading = true;

  users: any;
  dtOptions: any = {};
  dtTrigger = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  loggedUser;
  loggedUserSettings;
  show_add_buton = true;
  constructor(public dialog: MatDialog, public router: Router, private myservice: CommonService,
    private _flashMessagesService: FlashMessagesService) {
    this.loggedUser = JSON.parse(localStorage.getItem('user'));
    this.loggedUserSettings = JSON.parse(localStorage.getItem('userSettings'));
  }

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
          title: 'Buyers'
        },
        {
          extend: 'print',
          title: 'Buyers'
        },
        {
          extend: 'csv',
          title: 'Buyers'
        },
        {
          extend: 'excel',
          title: 'Buyers'
        }
      ],
      columns: [{
        title: 'ID',
        data: 'buyer_id'
      }, {
        title: 'Fullname',
        data: 'name'
      },
      {
        title: 'Email',
        data: 'email'
      },
      {
        title: 'Contact Number',
        data: 'contact',
      },
      {
        title: 'Address',
        data: 'address',
        class: 'none'
      },
      {
        title: 'Price Per Call',
        data: 'price_per_call',
        class: 'none'
      }, {
        title: 'Buffer Time',
        data: 'buffer_time',
        class: 'none'
      },
      {
        title: 'Created At',
        data: 'create_at',
        class: 'none'
      },
      {
        title: 'Status',
        data: 'status',
      },
      {
        title: 'Actions',
        class: 'control'
      }],
      responsive: true
    };
    if (this.loggedUser.role === 'publisher') {
      this.myservice.get('/buyer/getBuyerByPubId/' + this.loggedUser.uid)
        .subscribe(data => {
          if (this.loggedUserSettings.buyer_limit < data.buyer.length) {
            this.show_add_buton = false;
          }
          this.isLoading = false;
          this.users = data.buyer;
          this.dtTrigger.next();
        });
    } else if (this.loggedUser.role === 'admin') {
      this.myservice.get('/buyer/getBuyer/')
        .subscribe(data => {
          this.isLoading = false;
          this.users = data.buyer;
          this.dtTrigger.next();
        });
    } else {
      this.router.navigate(['/access-denied']);
    }
  }

  deleteBuyer(buyer_id) {
    if (confirm(`Are you sure to delete the buyer? All information related to the buyer and buyer numbers will be deleted.`)) {

      if (buyer_id) {
        this.myservice.delete('/buyer/deleteBuyer/' + buyer_id).subscribe(
          data => {
            if (data.statusCode === 200) {
              this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
                // Destroy the table first
                const r = dtInstance.data();
                r.map((e, i) => {
                  /* due to string and number comparison */
                  if (e[0] == buyer_id) {
                    dtInstance.row(i).remove();
                    dtInstance.draw();
                    this._flashMessagesService.show('Buyer is deleted successfully.',
                      { cssClass: 'alert-success', timeout: 3000 });
                  }
                });
              });

            }
          },
          err => {
            console.log(err);
          });
      } else {
        alert(`There is some error while deleting the buyer.`);
      }
    }
  }

}
