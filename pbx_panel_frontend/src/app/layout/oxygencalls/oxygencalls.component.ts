import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource, MatCheckboxModule, MatInputModule, MatTableModule, MatProgressSpinnerModule, MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Router, NavigationEnd } from '@angular/router';
import { NgDateRangePickerOptions } from 'ng-daterangepicker';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs';
import { DatePipe } from '@angular/common';
import { switchMap, debounceTime, tap } from 'rxjs/operators';
import { DataTableDirective } from 'angular-datatables';

import { routerTransition } from '../../router.animations';

import { CommonService } from '../../shared/services/common.service';

@Component({
    selector: 'app-oxygencalls',
    templateUrl: './oxygencalls.component.html',
    styleUrls: ['./oxygencalls.component.scss'],
    animations: [routerTransition()]
})

export class OxygencallsComponent implements OnInit {
    dtOptions: any = {};
    dtTrigger = new Subject();

    @ViewChild(DataTableDirective)
    dtElement: DataTableDirective;
    options: NgDateRangePickerOptions;
    grid_deleted = false;

    cdr;
    formdata;
    error = false;
    isLoading = true;

    constructor(public dialog: MatDialog, public router: Router, private myservice: CommonService,
        public datepipe: DatePipe) { }

    ngOnInit() {
        this.dtOptions = {
            pagingType: 'full_numbers',
            pageLength: 20,
            dom: 'Bfrtip',
            buttons: [
                {
                    extend: 'copy',
                    title: 'OxygenCalls'
                },
                {
                    extend: 'print',
                    title: 'OxygenCalls'
                },
                {
                    extend: 'csv',
                    title: 'OxygenCalls'
                },
                {
                    extend: 'excel',
                    title: 'OxygenCalls'
                }
            ],
            responsive: true,
        };
        this.options = {
            theme: 'default',
            range: 'tm',
            dayNames: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            presetNames: ['This Month', 'Last Month', 'This Week', 'Last Week', 'This Year', 'Last Year', 'Start', 'End'],
            dateFormat: 'd-M-y',
            outputFormat: 'MM/DD/YYYY',
            startOfWeek: 1
        };

        this.formdata = new FormGroup({
            daterange: new FormControl(''),
        });
        const current = (new Date()).getTime();
        let str = '';
        str += 'sdate=' + current + '&edate=' + current;

        this.myservice.get('/getOxygens?' + str)
            .subscribe(data => {
                this.cdr = data.cdr;
                this.dtTrigger.next();
                this.isLoading = false;
            });
    }

    ngAfterViewInit() {
    }


    searchWithFilter() {
        this.grid_deleted = false;
        this.isLoading = true;
        const data = this.formdata.value;
        let sdate = (new Date()).getTime();
        let edate = (new Date()).getTime();
        let query = '/getOxygens?';
        if (data.daterange !== '') {
            const dateArr = data.daterange.split('-');
            sdate = (new Date(dateArr[0])).getTime();
            edate = (new Date(dateArr[1])).getTime();
        }
        query += 'sdate=' + sdate + '&edate=' + edate;

        this.myservice.get(query)
            .subscribe(data => {
                this.cdr = data.cdr;
                this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
                    // Destroy the table first
                    dtInstance.destroy();
                    // Call the dtTrigger to rerender again
                    this.dtTrigger.next();
                });
                this.isLoading = false;
            });

    }
    changeStatus(id) {
        this.grid_deleted = false;
        this.isLoading = true;
        this.myservice.get('/cdr/updateStatus/' + id)
            .subscribe(data => {
                this.searchWithFilter();
                this.grid_deleted = true;
            });
        //console.log(id);
    }
}
