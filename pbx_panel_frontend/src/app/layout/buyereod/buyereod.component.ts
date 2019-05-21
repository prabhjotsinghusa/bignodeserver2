import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource, MatCheckboxModule, MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Router, NavigationEnd } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs';
import { DatePipe } from '@angular/common';
import { Angular5Csv } from 'angular5-csv/dist/Angular5-csv';
import { switchMap, debounceTime, tap } from 'rxjs/operators';
import { routerTransition } from '../../router.animations';
import { DataTableDirective } from 'angular-datatables';

import { CommonService } from '../../shared/services/common.service';

import { ExcelService } from '../../shared/services/excel.service';

@Component({
    selector: 'app-buyereod',
    templateUrl: './buyereod.component.html',
    styleUrls: ['./buyereod.component.scss'],
    animations: [routerTransition()]
})

export class BuyereodComponent implements OnInit {
    dtOptions: any = {};
    dtTrigger = new Subject();
    @ViewChild(DataTableDirective)
    dtElement: DataTableDirective;

    grid_deleted = false;

    EOD: any;
    formdata;
    error = false;
    isLoading = true;
    selected_date: any;
    total_records = 0;

    Math: any;
    constructor(public dialog: MatDialog, public router: Router, private myservice: CommonService, public datepipe: DatePipe) {
        this.Math = Math;
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
                    title: 'BuyerEOD'
                },
                {
                    extend: 'print',
                    title: 'BuyerEOD'
                },
                {
                    extend: 'csv',
                    title: 'BuyerEOD'
                },
                {
                    extend: 'excel',
                    title: 'BuyerEOD'
                }
            ],
        };
        this.formdata = new FormGroup({
            selected_date: new FormControl(''),
        });

        const query = '/eod/getBuyers';
        this.myservice.get(query)
            .subscribe(data => {
                this.EOD = data.data;
                this.dtTrigger.next();
                this.isLoading = false;
            });
    }
    ngOnDestroy(): void {
        // Do not forget to unsubscribe the event
        this.dtTrigger.unsubscribe();
    }


    ngAfterViewInit() { }

    searchWithFilter() {
        this.isLoading = true;
        const data = this.formdata.value;
        let query = '/eod/getBuyers?';
        if (data.selected_date) {
            const selected_date = (new Date(data.selected_date.year, (data.selected_date.month - 1),
                (data.selected_date.day))).getTime();
            query += '&selected_date=' + selected_date;
        }
        this.myservice.get(query)
            .subscribe(data => {
                this.EOD = data.data;
                this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
                    // Destroy the table first
                    dtInstance.destroy();
                    // Call the dtTrigger to rerender again
                    this.dtTrigger.next();
                });
                this.isLoading = false;
            });

    }
}

