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
    selector: 'app-userhistory',
    templateUrl: './userhistory.component.html',
    styleUrls: ['./userhistory.component.scss'],
    animations: [routerTransition()]
})

export class UserhistoryComponent implements OnInit {
    dtOptions: any = {};
    dtTrigger = new Subject();
    @ViewChild(DataTableDirective)
    dtElement: DataTableDirective;

    grid_deleted = false;
    userhistory: any;
    error = false;
    isLoading = true;
    selected_pub_id = 0;

    constructor(public dialog: MatDialog, public router: Router, private myservice: CommonService) {

    }

    ngOnInit() {
        this.dtOptions = {
            pagingType: 'full_numbers',
            pageLength: 20,
            order: [[0, 'desc']],
            dom: 'Bfrtip',
            buttons: [
                {
                    extend: 'copy',
                    title: 'Userhistory'
                },
                {
                    extend: 'print',
                    title: 'Userhistory'
                },
                {
                    extend: 'csv',
                    title: 'Userhistory'
                },
                {
                    extend: 'excel',
                    title: 'Userhistory'
                }
            ],
            responsive: true,
        };
        this.refreshData(1);
    }
    refreshData(c = 0) {
        this.isLoading = true;
        this.myservice.get('/userhistory/find')
            .subscribe(data => {
                this.userhistory = data.data;
                if (c) {
                    this.dtTrigger.next();
                } else {
                    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
                        // Destroy the table first
                        dtInstance.destroy();
                        // Call the dtTrigger to rerender again
                        this.dtTrigger.next();
                    });
                }

                this.isLoading = false;
            });
    }
    ngOnDestroy(): void {
        // Do not forget to unsubscribe the event
        this.dtTrigger.unsubscribe();
    }
    deleteHistory(e, i) {
        if (confirm('Are you sure to delete the history?')) {
            this.isLoading = true;
            this.myservice.delete('/userhistory/delete?id=' + e['_id']).subscribe(data => {
                console.log(data);
                if (data) {
                    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
                        // Destroy the table first
                        dtInstance.row(i).remove();
                        dtInstance.draw();
                        // console.log(dtInstance);
                        this.refreshData();
                    });
                }
            });
        }
    }
    deleteAll() {
        if (confirm('Are you sure to clear the history?')) {
            this.isLoading = true;
            this.myservice.delete('/userhistory/deleteAll').subscribe(data => {
                console.log(data);
                if (data) {
                    this.refreshData();
                }
            });
        }
    }
}
