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
    selector: 'app-eod',
    templateUrl: './eod.component.html',
    styleUrls: ['./eod.component.scss'],
    animations: [routerTransition()]
})

export class EodComponent implements OnInit {    
    dtOptions: any = {};
    dtTrigger = new Subject();
    @ViewChild(DataTableDirective)
    dtElement: DataTableDirective;

    grid_deleted = false;

    EOD:any;
    formdata;
    error = false;
    isLoading = true;
    Groups: Observable<any>;
    selectedPublishers;
    selected_pub_id = 0;
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
            order: [[0, 'desc'], [1, 'desc']],
            dom: 'Bfrtip',
            buttons: [
                {
                    extend: 'copy',
                    title: 'EOD'
                },
                {
                    extend: 'print',
                    title: 'EOD'
                },
                {
                    extend: 'csv',
                    title: 'EOD'
                },
                {
                    extend: 'excel',
                    title: 'EOD'
                }
            ],
        };
        this.formdata = new FormGroup({
            pub_id: new FormControl(''),
            selected_date: new FormControl(''),
            gid: new FormControl(''),

        });

        this.myservice.get('/getGroups/')
            .subscribe(data => {
                this.Groups = data.result;
            });


        const query = '/getPubs';
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
 
    getPublishers(event) {
        this.selectedPublishers = [];
        this.formdata.patchValue({
            pub_id: '',
        });
        const gid = event.target.value;
        if (gid > 0) {
            this.myservice.get('/getGroups/' + gid)
                .subscribe(result => {
                    this.selectedPublishers = result.result[0].publishers;
                });
        }
    }
    ngAfterViewInit() {}

    searchWithFilter() {
        this.isLoading = true;
        const data = this.formdata.value;
        let query = '/getPubs?';
        if (data.pub_id) {
            data.pub_id.forEach(element => {
                query += '&pub_id[]=' + element;
            });
            this.total_records = data.pub_id.length;
        }
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

