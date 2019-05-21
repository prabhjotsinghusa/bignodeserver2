import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource, MatCheckboxModule, MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { NavigationEnd, Router, ActivatedRoute } from '@angular/router';
import { NgDateRangePickerOptions } from 'ng-daterangepicker';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs';
import { switchMap, debounceTime } from 'rxjs/operators';
import { Subscription } from 'rxjs/Subscription';

import { DataTableDirective } from 'angular-datatables';
import { routerTransition } from '../../router.animations';
import { Cdr } from "../../shared/models/cdr";

import { CommonService } from '../../shared/services/common.service';
import { PublisherService } from '../../shared/services/publisher.service';
import { CampService } from '../../shared/services/camp.service';



@Component({
  selector: 'app-buyerreport',
  templateUrl: './buyerreport.component.html',
  styleUrls: ['./buyerreport.component.scss'],
  animations: [routerTransition()]
})
export class BuyerreportComponent implements OnInit {


  dtOptions: any = {};
  dtTrigger = new Subject();
  options: NgDateRangePickerOptions;
  displayedColumns: string[] = ['date', 'buyerNumber', 'customerNumber', 'disposition', 'duration', 'callStart', 'callEnd'];
  dataSource = new MatTableDataSource<Cdr>(ELEMENT_DATA);

  grid_deleted = false;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;

  Cdr: Cdr[];
  formdata;
  error = false;
  isLoading = false;
  isLoadingcamp = false;
  isLoadingTable = true;
  filteredPublishers: Observable<any>;
  filteredCamp: Observable<any>;
  selected_buyer_id = '';
  selected_pub_id = 0;
  totalcalls = 0;
  totalansweredcalls = 0;
  buyerReport;
  totaluniqueansweredcalls = 0;
  aht = 0;
  loggedUser;
  loggedUserSettings;
  buyerSub: Subscription;
  buyerNumber: any;
  selectedAudio = -1;
  constructor(
    public dialog: MatDialog,
    private activeroute: ActivatedRoute,
    private route: ActivatedRoute,
    public router: Router,
    private myservice: CommonService,
    private publisherservice: PublisherService,
    private campservice: CampService) {

    this.loggedUser = JSON.parse(localStorage.getItem('user'));
    this.loggedUserSettings = JSON.parse(localStorage.getItem('userSettings'));

    route.params.subscribe(val => {

      this.ngOnInit();

    });

  }

  ngOnInit() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 20,
      dom: 'Bfrtip',
      buttons: [
        'copy',
        'print',
        'csv',
        'excel'
      ]
    };

    this.formdata = new FormGroup({
      pub_id: new FormControl(''),
      daterange: new FormControl(''),
      camp_id: new FormControl('')
    });

    let str = '';
    const current = (new Date()).getTime();
    str += 'sdate=' + current + '&edate=' + current;

    this.selected_buyer_id = this.loggedUser.buyer_id;
    str += '&buyer_id=' + this.selected_buyer_id;


    this.buyerSub = this.activeroute.params.subscribe(params => {

      if (params.buyerNumber) {
        let b = [];
        b = [...b, params.buyerNumber];
        this.buyerNumber = JSON.stringify(b)
        str += '&buyerNumber=' + this.buyerNumber;
      }
    });

    this.myservice.get('/buyerReport?' + str)
      .subscribe(data => {
        this.totalcalls = data.totalcalls;
        this.buyerReport = data.buyerReport;
        // this.dtTrigger.next();
        this.isLoadingTable = false;
      });

    // total unique calls-current date
    this.myservice.get('/getTotalUniquieCalls?' + str)
      .subscribe(data => {
        this.totalansweredcalls = data.totalansweredcalls;
      });
    // total unique answered calls-current date

    this.myservice.get('/getTotalUniqueAnsweredCalls?' + str)
      .subscribe(data => {
        this.totaluniqueansweredcalls = data.totaluniqueansweredcalls;
      });

    // AHT
    this.myservice.get('/getAHT?' + str)
      .subscribe(data => {
        if (data.aht[0] !== undefined) {
          this.aht = Math.round(data.aht[0].aht / 60);
        }
      });

    this.options = {

      theme: 'default',
      range: 'tm',
      dayNames: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      presetNames: ['This Month', 'Last Month', 'This Week', 'Last Week', 'This Year', 'Last Year', 'Start', 'End'],
      dateFormat: 'd-M-y',
      outputFormat: 'MM/DD/YYYY',
      startOfWeek: 1

    };
  }

  ngAfterViewInit(): void { this.dtTrigger.next(); }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
    this.buyerSub.unsubscribe();
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
    this.isLoadingcamp = true;
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
    this.isLoadingTable = false;
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }

  searchWithFilter() {

    const data = this.formdata.value;

    if (data.pub_id.uid > 0) {
      data.pub_id = data.pub_id.uid;
    }
    if (data.camp_id.campaign_id > 0) {
      data.camp_id = data.camp_id.campaign_id;
    }
    if (data.daterange === '') {
      data.sdate = '';
      data.edate = '';
    } else {
      const dateArr = data.daterange.split('-');
      // console.log(dateArr);
      data.sdate = new Date(dateArr[0]).getTime();
      data.edate = new Date(dateArr[1]).getTime();
    }

    let str = '';

    if (data.sdate === '') {
      str += 'sdate=&edate=';
    } else {
      str += 'sdate=' + data.sdate + '&edate=' + data.edate;
    }

    if (data.pub_id !== '') {
      str += '&pub_id=' + data.pub_id;
    }

    if (data.camp_id !== '') {
      str += '&camp_id=' + data.camp_id;
    }

    if (this.loggedUser.role == 'buyer') {

      this.selected_buyer_id = this.loggedUser.buyer_id;
      str += '&buyerNumber=' + this.buyerNumber;
      //str += '&buyer_id=' + this.selected_buyer_id;
    }

    this.myservice.get('/buyerReport?' + str)
      .subscribe(data => {
        this.isLoadingTable = false;
        this.totalcalls = data.totalcalls;
        this.buyerReport = data.buyerReport;
        this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
          // Destroy the table first
          dtInstance.destroy();
          // Call the dtTrigger to rerender again
          this.dtTrigger.next();
        });

      });
    // total unique calls-current date
    this.myservice.get('/getTotalUniquieCalls?' + str)
      .subscribe(data => {
        this.totalansweredcalls = data.totalansweredcalls;
      });
    // total unique answered calls-current date

    this.myservice.get('/getTotalUniqueAnsweredCalls?' + str)
      .subscribe(data => {
        this.totaluniqueansweredcalls = data.totaluniqueansweredcalls;
      });

    // AHT
    this.myservice.get('/getAHT?' + str)
      .subscribe(data => {
        if (data.aht[0] !== undefined) {
          this.aht = Math.round(data.aht[0].aht / 60);
        }
      });
  }
  showAudio(i) {
    if (this.selectedAudio === i) {
      this.selectedAudio = -1;
    } else {
      this.selectedAudio = i;
    }
  }

}

const ELEMENT_DATA: Cdr[] = [];
