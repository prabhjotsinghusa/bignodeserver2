import { Component, OnInit, ViewChild, Input } from '@angular/core';

import { MatPaginator, MatSort, MatTableDataSource, MatCheckboxModule, MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Router, NavigationEnd } from '@angular/router';
import { NgDateRangePickerOptions } from 'ng-daterangepicker';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { switchMap, debounceTime } from 'rxjs/operators';
import { DataTableDirective } from 'angular-datatables';
import { routerTransition } from '../../router.animations';
import { AgentReport } from "../../shared/models/agentreport";
import { HttpClient, HttpResponse } from '@angular/common/http';
import { CommonService } from '../../shared/services/common.service';
import { PublisherService } from '../../shared/services/publisher.service';
import { CampService } from '../../shared/services/camp.service';
import { ExcelService } from '../../shared/services/excel.service';
import { Angular5Csv } from 'angular5-csv/dist/Angular5-csv';


@Component({
  selector: 'app-agentreport',
  templateUrl: './agentreport.component.html',
  styleUrls: ['./agentreport.component.scss'],
  animations: [routerTransition()]
})
export class AgentreportComponent implements OnInit {

  length = 0;
  pageSize = 20;
  pageSizeOptions: number[] = [20];
  excelData: any = [];
  excelCopyData: any = [];
  dtTrigger = new Subject();
  options: NgDateRangePickerOptions;

  // displayedColumns: string[] = ['start', 'did', 'src', 'buyerName', 'desc', 'disposition', 'duration', 'publisherName', 'status'];
  displayedColumns: string[] = [
    'start',
    'end',
    'src',
    'buyer_id',
    'desc',
    'disposition',
    'duration',
   // 'recordingfile'
  ];

  dataSource = new MatTableDataSource<AgentReport>(ELEMENT_DATA);

  grid_deleted = false;

  @ViewChild(DataTableDirective)
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  dtElement: DataTableDirective;

  AgentReport: AgentReport[];
  formdata;
  error = false;
  error_message = `Some error occur.`;
  isLoading = false;
  isLoadingcamp = false;
  isLoadingTable = true;
  filteredPublishers: Observable<any>;
  filteredCamp: Observable<any>;
  selected_pub_id = 0;
  totalcalls = 0;
  totalansweredcalls = 0;
  cdr;
  totaluniqueansweredcalls = 0;
  aht = 0;
  page = 0;
  loggedUser;
  loggedUserSettings;
  buyerNumber: any;
  constructor(

    public dialog: MatDialog,
    public router: Router,
    private excelService: ExcelService,
    private myservice: CommonService,
    private publisherservice: PublisherService,
    private campservice: CampService,
    private http: HttpClient

  ) {
    this.loggedUser = JSON.parse(localStorage.getItem('user'));
    this.loggedUserSettings = JSON.parse(localStorage.getItem('userSettings'));
  }

  ngOnInit(): void {

    this.options = {

      theme: 'default',
      range: 'tm',
      dayNames: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      presetNames: ['This Month', 'Last Month', 'This Week', 'Last Week', 'This Year', 'Last Year', 'Start', 'End'],
      dateFormat: 'd-M-y',
      outputFormat: 'MM/DD/YYYY',
      startOfWeek: 1,
      //timezone: 'cst'

    };

    const current = (new Date()).getTime();

    let str = '';
    str += 'sdate=' + current + '&edate=' + current;
    str += '&page=' + this.page;
    str += '&limit=20';

    if (this.loggedUser.role === 'publisher') {
      this.selected_pub_id = this.loggedUser.uid;
      str += '&pub_id=' + this.loggedUser.uid;
      str += '&status=show';
    }

    if (this.loggedUser.role === 'buyer') {

      this.myservice.get('/BuyerNumbers/getBuyerNumber/' + this.loggedUser.buyer_id).subscribe(data => {
        if (data.buyerNumber) {
          let result = [];
          data.buyerNumber.map((b) => {
            result = [...result, b.number];
          });
          this.buyerNumber = JSON.stringify(result);
          str += '&buyerNumber=' + this.buyerNumber;
          this.getCDR(str);
        }
      });
      this.selected_pub_id = this.loggedUser.pub_id;

    } else {

      this.getCDR(str);

    }


    this.formdata = new FormGroup({
      // pub_id: new FormControl(''),
      daterange: new FormControl(''),
      // camp_id: new FormControl('')
    });

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

          'Date': value.start,
          'Time': value.start,
          'DID': value.did,
          'Customer Number': value.src,
          'Buyer Number': value.buyer_id,
          'Description': value.desc,
          'Disposition': value.disposition,
          'Duration': value.duration,
          'Publisher Name': value.publisherName,
          'Status': value.status,
          // 'Recording':`https://s3.us-east-2.amazonaws.com/cyberlynk-recordings/66_2019/${value.recordingfile}`

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
        headers: [
          'Date',
          'Time',
          'DID',
          'Customer Number',
          'BuyerNumber',
          'Description',
          'Disposition',
          'Duration',
          'PublisherName',
          'Status',
          //'Recording'
        ]
      };

      new Angular5Csv(this.excelData, 'csv_cr', options);
    }
  }

  onPageChanged(event) {

    const data = this.formdata.value;


    if (data.daterange === '') {
      data.sdate = (new Date()).getTime();
      data.edate = (new Date()).getTime();
    } else {
      const dateArr = data.daterange.split('-');
      data.sdate = (new Date(dateArr[0])).getTime();
      data.edate = (new Date(dateArr[1])).getTime();
    }

    let str = '';
    str += 'sdate=' + data.sdate + '&edate=' + data.edate;
    if (this.loggedUser.role === 'publisher') {

      this.selected_pub_id = this.loggedUser.uid;
      str += '&pub_id=' + this.loggedUser.uid;
      str += '&status=show';
    }

    if (this.loggedUser.role === 'buyer') {
      str += '&buyerNumber=' + this.buyerNumber;
    }

    console.log(event, "eventevent");

    str += '&page=' + event.pageIndex;
    str += '&limit=20';

    console.log(str, event, "==================================");

    this.myservice.get('/getAgentReport?' + str)
      .subscribe(data => {
        this.isLoadingTable = false;
        this.totalcalls = data.totalcalls;
        this.dataSource = data.cdr;


      });
  }

  getCDR(str) {

    console.log(str, "strstrstrstrstrstrstrstr");

    this.myservice.get(`/getAgentReport?` + str)
      .subscribe(data => {
        this.totalcalls = data.totalcalls;
        this.length = data.totalcalls;

        console.log(data.cdr, "cdrcdr")
        this.dataSource = data.cdr;
        this.excelData = data.cdr;
        this.dtTrigger.next();
        this.isLoadingTable = false;

        this.callafterload();
      });

    // total unique calls-current date
    this.myservice.get('/getAgentTotalUniquieCalls?' + str)
      .subscribe(data => {
        this.totalansweredcalls = data.totalansweredcalls;
      });
    // total unique answered calls-current date
    this.myservice.get('/getAgentTotalUniqueAnsweredCalls?' + str)
      .subscribe(data => {
        this.totaluniqueansweredcalls = data.totaluniqueansweredcalls;
      });
    // AHT
    this.myservice.get('/getAgentAHT?' + str)
      .subscribe(data => {
        if (data.aht[0] !== undefined) {
          this.aht = Math.round(data.aht[0].aht / 60);
        }
      });

  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }
  hideLoader() {
    this.isLoading = false;
    const p = this.formdata.get('pub_id').value;
    this.selected_pub_id = p.uid;
  }
  showLoader() {
    this.isLoading = true;
  }
  hideLoadercamp() {
    this.isLoadingcamp = false;
  }
  showLoadercamp() {
    this.error = false;
    this.isLoadingcamp = true;
    if (!(this.selected_pub_id > 0)) {
      this.hideLoadercamp();
      this.error = true;
      this.error_message = `Please select publisher first.`;
    }
  }

  displayFn(publisher) {
    if (publisher) { return publisher.fullname; }
  }

  displayFnCamp(campaign) {
    if (campaign) { return campaign.camp_name; }
  }

  callafterload() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  searchWithFilter() {

    this.isLoadingTable = true;
    this.totalcalls = 0;
    this.totalansweredcalls = 0;
    this.totaluniqueansweredcalls = 0;
    this.aht = 0;

    const data = this.formdata.value;
    console.log(data, "==================================")

    if (data.daterange === '') {
      data.sdate = (new Date()).getTime();
      data.edate = (new Date()).getTime();
    } else {
      const dateArr = data.daterange.split('-');
      data.sdate = (new Date(dateArr[0])).getTime();
      data.edate = (new Date(dateArr[1])).getTime();
    }

    let str = '';
    str += 'sdate=' + data.sdate + '&edate=' + data.edate;
    if (this.loggedUser.role === 'publisher') {

      this.selected_pub_id = this.loggedUser.uid;
      str += '&pub_id=' + this.loggedUser.uid;
      str += '&status=show';
    }

    if (this.loggedUser.role === 'buyer') {
      str += '&buyerNumber=' + this.buyerNumber;
    }

    str += '&page=' + this.page;
    str += '&limit=20';
    console.log(str, "==================================");
    this.myservice.get('/getAgentReport?' + str)
      .subscribe(data => {
        this.isLoadingTable = false;
        this.totalcalls = data.totalcalls;
        this.length = data.totalcalls;
        this.dataSource = data.cdr;


      });
    // total answered calls-current date
    this.myservice.get('/getAgentTotalUniquieCalls?' + str)
      .subscribe(data => {
        this.totalansweredcalls = data.totalansweredcalls;
      });
    // total unique answered calls-current date

    this.myservice.get('/getAgentTotalUniqueAnsweredCalls?' + str)
      .subscribe(data => {
        this.totaluniqueansweredcalls = data.totaluniqueansweredcalls;
      });
    this.myservice.get('/getAgentAHT?' + str)
      .subscribe(data => {
        if (data.aht[0] !== undefined) {
          this.aht = Math.round(data.aht[0].aht / 60);
        }
      });
  }

}

const ELEMENT_DATA: AgentReport[] = [];
