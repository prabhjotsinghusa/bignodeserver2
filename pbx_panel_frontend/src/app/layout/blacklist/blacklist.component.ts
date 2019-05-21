import { Component, OnInit, ViewChild, Input } from '@angular/core';
import {
    MatPaginator, MatSort, MatTableDataSource, MatCheckboxModule, MatDialog, MatDialogConfig, MatDialogRef,
    MAT_DIALOG_DATA
} from '@angular/material';
import { Router, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs';
import { routerTransition } from '../../router.animations';

import { DataTableDirective } from 'angular-datatables';

import { CommonService } from '../../shared/services/common.service';

@Component({
    selector: 'app-blacklist',
    templateUrl: './blacklist.component.html',
    styleUrls: ['./blacklist.component.scss'],
    animations: [routerTransition()]
})

export class BlacklistComponent implements OnInit {
    dtOptions: any = {};
    dtTrigger = new Subject();
    @ViewChild(DataTableDirective)
    dtElement: DataTableDirective;

    grid_deleted = false;
    blacklist: any;
    error = false;
    isLoading = true;
    selected_pub_id = 0;

    constructor(public dialog: MatDialog, public router: Router, private myservice: CommonService) {

    }

    ngOnInit() {
        this.dtOptions = {
            pagingType: 'full_numbers',
            pageLength: 20,
            order: [[0, 'asc']],
            dom: 'Bfrtip',
            buttons: [
                {
                    extend: 'copy',
                    title: 'Blacklist'
                },
                {
                    extend: 'print',
                    title: 'Blacklist'
                },
                {
                    extend: 'csv',
                    title: 'Blacklist'
                },
                {
                    extend: 'excel',
                    title: 'Blacklist'
                }
            ],
            responsive: true,
        };

        this.myservice.get('/cdr/getblacklist')
            .subscribe(data => {
                this.blacklist = data.data;
                this.dtTrigger.next();
                this.isLoading = false;
            });

    }
    ngOnDestroy(): void {
        // Do not forget to unsubscribe the event
        this.dtTrigger.unsubscribe();
    }
    unblockNumber(num) {
        this.isLoading = true;
        if (confirm('Are you sure to unblock the number?')) {
            this.myservice.post('/cdr/delblacklist', { num: num }).subscribe(data => {
                if (data.success === 'OK') {
                    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
                        // Destroy the table first
                        const r = dtInstance.data();
                        r.map((v, index) => {
                            console.log(v, num);
                            if (v[1] === num) {
                                dtInstance.row(index).remove();
                                dtInstance.draw();
                            }
                        });
                        // console.log(dtInstance);
                        this.isLoading = false;
                    });
                }
            });
        }
    }
}
