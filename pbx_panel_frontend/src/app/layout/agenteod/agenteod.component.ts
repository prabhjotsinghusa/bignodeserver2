import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource, MatCheckboxModule, MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Router, NavigationEnd } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs';
import { DatePipe } from '@angular/common';
import {Angular5Csv} from 'angular5-csv/dist/Angular5-csv';
import { switchMap, debounceTime, tap } from 'rxjs/operators';
import { routerTransition } from '../../router.animations';
import { Cdr } from "../../shared/models/cdr";
import { DataTableDirective } from 'angular-datatables';

import { CommonService } from '../../shared/services/common.service';

import { ExcelService } from '../../shared/services/excel.service';

@Component({
    selector: 'app-eod',
    templateUrl: './agenteod.component.html',
    styleUrls: ['./agenteod.component.scss'],
    animations: [routerTransition()]
})

export class AgentComponent implements OnInit {
    dtOptions: any = {};
    dtTrigger = new Subject();
    @ViewChild(DataTableDirective)
    dtElement: DataTableDirective;

    grid_deleted = false;

    EOD: any;
    formdata;
    error = false;
    isLoading = true;
    selectedPublishers;
    selected_pub_id = 0;
    selected_date: any;

    Math: any;
    constructor(public dialog: MatDialog, public router: Router, private myservice: CommonService,
        private excelService: ExcelService, public datepipe: DatePipe) {
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
                    title: 'AgentEOD'
                },
                {
                    extend: 'print',
                    title: 'AgentEOD'
                },
                {
                    extend: 'csv',
                    title: 'AgentEOD'
                },
                {
                    extend: 'excel',
                    title: 'AgentEOD'
                }
            ],
            responsive: true,
        };
        this.formdata = new FormGroup({
            selected_date: new FormControl(''),
        });
        const query = '/getAgents?';
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
    searchWithFilter() {
        this.isLoading = true;
        const data = this.formdata.value;
        let query = '/getAgents?';


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

