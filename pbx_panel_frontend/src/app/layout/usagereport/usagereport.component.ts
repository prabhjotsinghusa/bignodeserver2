import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource, MatCheckboxModule, MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Router, NavigationEnd } from '@angular/router';
import { NgDateRangePickerOptions } from 'ng-daterangepicker';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs';
import * as moment from 'moment';
import { DatePipe } from '@angular/common';
import { Angular5Csv } from 'angular5-csv/dist/Angular5-csv';
import { switchMap, debounceTime } from 'rxjs/operators';


import { routerTransition } from '../../router.animations';
import { UsageReport } from '../../shared/models/usagereport';
import { ExcelService } from '../../shared/services/excel.service';
import { CommonService } from '../../shared/services/common.service';
import { PublisherService } from '../../shared/services/publisher.service';
import { Publisher } from '../../shared/services';

@Component({
    selector: 'app-usagereport',
    templateUrl: './usagereport.component.html',
    styleUrls: ['./usagereport.component.scss'],
    animations: [routerTransition()]
})
export class UsagereportComponent implements OnInit {

    dtOptions: any = {};
    dtTrigger = new Subject();
    options: NgDateRangePickerOptions;
    displayedColumns: string[] = ['_id', 'total', 'charge_per_minute', 'total_amount'];
    dataSource = new MatTableDataSource<UsageReport>(ELEMENT_DATA);
    excelData: any = [];
    excelCopyData: any = [];
    grid_deleted = false;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    UsageReport: UsageReport[];
    formdata;
    error = false;
    isLoading = false;
    isLoadingcamp = false;
    Groups: Observable<any>;
    filteredPublishers: Observable<any>;
    selectedPublishers;
    selected_pub_id = 0;
    totalcalls = 0;
    totalansweredcalls = 0;
    totaluniqueansweredcalls = 0;
    resultsLength = 0;
    isLoadingResults = true;
    eodreport;
    loggedUser: any;
    loggedUserSettings: any;
    ranges: any = {
        'Today': [moment(), moment()],
        'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
        'Last 7 Days': [moment().subtract(6, 'days'), moment()],
        'Last 30 Days': [moment().subtract(29, 'days'), moment()],
        'This Month': [moment().startOf('month'), moment().endOf('month')],
        'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
    };
    // daterange: any;
    constructor(
        public dialog: MatDialog,
        public router: Router,
        private myservice: CommonService,
        private publisherservice: PublisherService,
        private excelService: ExcelService,
        public datepipe: DatePipe) {
        this.loggedUser = JSON.parse(localStorage.getItem('user'));
        this.loggedUserSettings = JSON.parse(localStorage.getItem('userSettings'));
    }

    ngOnInit() {
        this.dataSource.paginator = this.paginator;

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

            pub_id: new FormControl(''),
            daterange: new FormControl(''),
            //gid: new FormControl(''),

        });

        this.filteredPublishers = this.formdata.get('pub_id').valueChanges.pipe(
            debounceTime(200),
            switchMap(value => this.publisherservice.search(value))
        );

        const data = this.formdata.value;
        let query = '/usageReport?';

        data.sdate = Date.now();
        data.sdate = new Date(data.sdate);
        data.sdate = moment(data.sdate).format('YYYY-MM-DD 00:00:00');
        data.edate = Date.now();
        data.edate = new Date(data.edate);
        data.edate = moment(data.edate).format('YYYY-MM-DD 23:59:59');

        query += '&sdate=' + data.sdate + '&edate=' + data.edate;

        if (data.pub_id) {
            query += '&pub_id=' + data.pub_id;
        }

        if (this.loggedUser.role === 'publisher') {
            query += '&pub_id=' + this.loggedUser.uid;
            if (!this.loggedUserSettings.charge_per_minute) {
                this.displayedColumns = ['_id', 'total'];
            }
        }
        // console.log(query, '==================');

        this.myservice.get(query)
            .subscribe(data => {

                this.resultsLength = data.usageReport.length;
                this.isLoadingResults = false;
                this.dataSource = new MatTableDataSource<UsageReport>(data.usageReport);
                this.excelData = data.usageReport;
                this.callafterload();

            });

    }

    callafterload() {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
    }
    applyFilter(filterValue: string) {
        filterValue = filterValue.trim(); // Remove whitespace
        filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
        this.dataSource.filter = filterValue;
    }

    searchWithFilter() {
        this.isLoadingResults = true;
        const data = this.formdata.value;
        // console.log(data, '===================')
        let query = '/usageReport?';


        if (data.daterange !== undefined && data.daterange.start !== undefined && data.daterange.end !== undefined) {
            data.sdate = data.daterange.start.format('YYYY-MM-DD 00:00:00');
            data.edate = data.daterange.end.format('YYYY-MM-DD 23:59:59');
        } else {
            data.sdate = Date.now();
            data.sdate = new Date(data.sdate);
            data.sdate = moment(data.sdate).format('YYYY-MM-DD 00:00:00');
            data.edate = Date.now();
            data.edate = new Date(data.edate);
            data.edate = moment(data.edate).format('YYYY-MM-DD 23:59:59');
        }

        query += '&sdate=' + data.sdate + '&edate=' + data.edate;

        if (data.pub_id) {

            query += '&pub_id=' + data.pub_id.uid;
        }
        if (this.loggedUser.role === 'publisher') {
            query += '&pub_id=' + this.loggedUser.uid;
        }

        this.myservice.get(query)
            .subscribe(data => {
                this.resultsLength = data.usageReport.length;
                this.isLoadingResults = false;
                this.dataSource = new MatTableDataSource<UsageReport>(data.usageReport);
                this.excelData = data.usageReport;
                this.callafterload();

            });
    }

    printData(value) {

        if (value === 1) {

            let el = document.getElementById('print-section');
            let body = document.body, range, sel;
            if (document.createRange && window.getSelection) {
                range = document.createRange();
                sel = window.getSelection();
                sel.removeAllRanges();
                try {
                    range.selectNodeContents(el);
                    sel.addRange(range);
                } catch (e) {
                    range.selectNode(el);
                    sel.addRange(range);
                }
                document.execCommand('copy');

            }

        } else if (value === 2) {

            let printContents, popupWin;
            printContents = document.getElementById('print-section').innerHTML;
            popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
            popupWin.document.open();
            popupWin.document.write(printContents);
            popupWin.document.close();

        } else if (value === 3) {

            this.excelData.forEach(value => {
                this.excelCopyData.push({
                    'Publisher Name': value.publisherName,
                    'DID': value.did,
                    'Customer Number': value.src
                });
            });

            this.excelService.exportAsExcelFile(this.excelCopyData, 'excel_cr');

        } else {
            let options = {
                fieldSeparator: ',',
                quoteStrings: '',
                decimalseparator: '.',
                showLabels: true,
                showTitle: true,
                headers: ['Publisher Name', 'DID', 'Customer Number']
            };

            new Angular5Csv(this.excelData, 'csv_cr', options);
        }
    }

    hideLoader() {
        this.isLoading = false;
    }
    showLoader() {
        this.isLoading = true;
    }

    displayFn(publisher) {
        if (publisher) { return publisher.fullname; }
    }
}

const ELEMENT_DATA: UsageReport[] = [];
