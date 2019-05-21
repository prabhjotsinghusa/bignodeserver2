import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource, MatCheckboxModule, MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA, MatDatepickerModule } from '@angular/material';
import { Router, NavigationEnd } from '@angular/router';
import { routerTransition } from '../../router.animations';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NgbCalendar, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { FlashMessagesService } from 'ngx-flash-messages';
import { Subject } from 'rxjs';
import { Angular5Csv } from 'angular5-csv/dist/Angular5-csv';
import { CustomerReport } from "../../shared/models/customerreport";
import { FileUtil } from './file.util';
import { Constants } from './test.constants';
import { ExcelService } from '../../shared/services/excel.service';
import { CommonService } from '../../shared/services/common.service';
import { RealtimeService } from '../../shared/services/realtime.service';
@Component({
    selector: 'app-customerreport',
    templateUrl: './customerreport.component.html',
    styleUrls: ['./customerreport.component.scss'],
    animations: [routerTransition()]
})

export class CustomerreportComponent implements OnInit {

    model: NgbDateStruct;
    dtOptions: any = {};
    dtTrigger = new Subject();
    displayedColumns: string[] = ['publisherName', 'did', 'src' ,'send'];
    dataSource = new MatTableDataSource<CustomerReport>(ELEMENT_DATA);

    customerMessage = false;
    //fileImportInput: any;
    excelCopyData: any = [];
    excelData: any = [];
    customerData: any = [];
    isLoadingTable = false;
    csvRecords = [];
    customerreport: CustomerReport[];
    formdata;
    flashMessage = false;
    dateValue;
    pageSize = 20;


    @ViewChild('fileImportInput') fileImportInput: ElementRef;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild('datatable') table: ElementRef;
    @ViewChild(MatSort) sort: MatSort;

    constructor(
        public dialog: MatDialog,
        public router: Router,
        private myservice: CommonService,
        private realTimeService: RealtimeService,
        private calendar: NgbCalendar,
        private excelService: ExcelService,
        private _fileUtil: FileUtil,
        private flashMessagesService: FlashMessagesService
    ) {
    }

    ngOnInit() {
        //this.callafterload();
    }

    // METHOD CALLED WHEN CSV FILE IS IMPORTED
    fileChangeListener($event): void {

        this.isLoadingTable = true;
        var text = [];
        var target = $event.target || $event.srcElement;
        var files = target.files;
        var input = $event.target;
        var reader = new FileReader();
        if (input.files.length > 0) {

            reader.readAsText(input.files[0]);

            reader.onload = (data) => {

                if (data) {

                    let csvData = reader.result;
                    let csvRecordsArray = csvData.split(/\r\n|\n/);
                    csvRecordsArray = csvRecordsArray.filter(function (item, pos) {

                        return csvRecordsArray.indexOf(item) == pos;
                        
                    }).slice(0, -1);

                    let headerLength = -1;
                    
                    if (Constants.isHeaderPresentFlag) {

                        let headersRow = this._fileUtil.getHeaderArray(csvRecordsArray, Constants.tokenDelimeter);
                        headerLength = headersRow.length;
                    }

                        this.csvRecords = this._fileUtil.getDataRecordsArrayFromCSVFile(csvRecordsArray,
                        headerLength, Constants.validateHeaderAndRecordLengthFlag, Constants.tokenDelimeter);

                    let query = '/customerReport?', s = "";

                    let formatDate;
                    if (this.dateValue == undefined) {
                        
                        formatDate = new Date().toISOString().slice(0, 10);
                    } else {
                        formatDate = this.dateValue.year.toString() + '-' + ('0' + this.dateValue.month.toString()).slice(-2) + '-' + ('0' + this.dateValue.day.toString()).slice(-2);
                    }

                    s += "&date=" + formatDate;
                    this.myservice.post(query + s, { csvRecords: this.csvRecords })
                        .subscribe(
                            data => {
                                this.isLoadingTable = false;

                                if (data.length > 0) {
                                    // data=data.filter(item=>{return item!=null});
                                    
                                    this.excelData = data;
                                    this.dataSource = new MatTableDataSource<CustomerReport>(data);
                                    this.callafterload();

                                } else {
                                    
                                    this.flashMessage = true;
                                    this.flashMessagesService.show('Customer report not found!', {
                                        classes: ['alert', 'alert-warning'], // You can pass as many classes as you need
                                        timeout: 5000, // Default is 3000
                                    });
                                }
                            },
                            err => {
                                console.log(err, 'error');
                            }
                        );
                }
            }
        } else {
            this.isLoadingTable = false;
            this.flashMessage = true;
            this.flashMessagesService.show('Please select file to read', {
                classes: ['alert', 'alert-warning'], // You can pass as many classes as you need
                timeout: 5000, // Default is 3000
            });
        }


        reader.onerror = function () {
            alert('Unable to read ' + input.files[0]);
        };
    };

    callafterload() {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
    }


    applyFilter(filterValue: string) {

        filterValue = filterValue.trim(); // Remove whitespace
        filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
        this.dataSource.filter = filterValue;
    }


    printData(value) {

        if (value == 1) {
            
            let el = document.getElementById('print-section');
            var body = document.body, range, sel;
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
                document.execCommand("copy");

            }
            //  else if (body.createTextRange) {
            //     range = body.createTextRange();
            //     range.moveToElementText(el);
            //     range.select();
            //     range.execCommand("Copy");
            // }

        }
        else if (value == 2) {

            let printContents, popupWin;
            printContents = document.getElementById('print-section').innerHTML;
            popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
            popupWin.document.open();
            popupWin.document.write(printContents);
            popupWin.document.close();

        } else if (value == 3) {

            this.excelData.forEach(value => {
                this.excelCopyData.push({
                    'Publisher Name': value.publisherName,
                    'DID': value.did,
                    'Customer Number': value.src
                });
            });

            this.excelService.exportAsExcelFile(this.excelCopyData, 'excel_cr');

        }
        else {

            let options = {
                fieldSeparator: ',',
                quoteStrings: '"',
                decimalseparator: '.',
                showLabels: true,
                showTitle: true,
                headers: ['Publisher Name', 'DID', 'Customer Number']
            };

            new Angular5Csv(this.excelData, 'csv_cr', options);
        }
    }

    ngOnDestroy(): void {
        // Do not forget to unsubscribe the event
        this.dtTrigger.unsubscribe();
    }

    reset() {
        this.fileImportInput.nativeElement.value = "";
        //this.csvRecords = [];
    }
    changeStatus(src,did,publisherName) {
        let token = '';
        let dataa = {chat_id:'681365054',text: 'did: ' + did + '\n' + 'src: ' + src + '\n' + 'publisher: ' + publisherName};
        if(publisherName == 'French Connection'){
             token = 'bot886264941:AAF9jPdwsLfzrUJNt7IG-SSCQt5C0ZxdFI4';
        }
        else{
            token = '';
        }
        let str = 'https://api.telegram.org/' + token + '/sendMessage';
        this.realTimeService.post(str, dataa)
        .subscribe(
            data => {
                console.log(data);
            },
            err => {
                console.log(err, 'error');
            }
        );

        console.log(src,did,publisherName);
    }

}
const ELEMENT_DATA: CustomerReport[] = [];
