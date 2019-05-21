import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource, MatCheckboxModule, MatDialog, MatDialogConfig, 
    MatDialogRef } from '@angular/material';
import { Router, NavigationEnd } from '@angular/router';
import { FlashMessagesService } from 'angular2-flash-messages';

import { Subject } from 'rxjs';
import { routerTransition } from '../../router.animations';
import { DataTableDirective } from 'angular-datatables';
import { CommonService } from '../../shared/services/common.service';

@Component({
    selector: 'app-buyernumbers',
    templateUrl: './buyernumbers.component.html',
    styleUrls: ['./buyernumbers.component.scss'],
    animations: [routerTransition()]
})

export class BuyernumbersComponent implements OnInit {
    dtOptions: any = {};
    dtTrigger = new Subject();
    pub_id;
    grid_deleted = false;
    error = false;
    selected_tfn;
    selected_pub_id = '';
    buyerdata = [];
    loggedUser;
    loggedUserSettings;
    panelOpenIndex = 0;
    intervalVar;
    @ViewChild(DataTableDirective)
    dtElement: DataTableDirective;
 
    constructor(

        public dialog: MatDialog, 
        public router: Router, 
        private myservice: CommonService,
        private _flashMessagesService: FlashMessagesService
        
        ) {
        this.loggedUser = JSON.parse(localStorage.getItem('user'));
        this.loggedUserSettings = JSON.parse(localStorage.getItem('userSettings'));
    }

    ngOnInit() {
        this.dtOptions = {
            pagingType: 'full_numbers',
            pageLength: 20//,
           // dom: 'Bfrtip',
           // buttons: ['copy', 'print', 'csv', 'excel']
        };
        let str = '/BuyerNumbers/getAll';
        this.myservice.get(str)
            .subscribe(result => {
              //  console.log(result);
                this.buyerdata = result.data;
                this.dtTrigger.next();
            });
        
    }


    

  
}

