import { Component, OnInit, ViewChild, Input } from "@angular/core";
import {
  MatPaginator,
  MatSort,
  MatTableDataSource,
  MatCheckboxModule,
  MatDialog,
  MatDialogConfig,
  MatDialogRef,
  MAT_DIALOG_DATA
} from "@angular/material";
import { Router, NavigationEnd } from "@angular/router";
import { NgDateRangePickerOptions } from "ng-daterangepicker";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { Observable, iif } from "rxjs";
import { Subject } from "rxjs";
import { switchMap, debounceTime } from "rxjs/operators";
import { DataTableDirective } from "angular-datatables";

import { routerTransition } from "../../router.animations";
import { Cdr } from "../../shared/models/cdr";

import { CommonService } from "../../shared/services/common.service";
import { PublisherService } from "../../shared/services/publisher.service";
import { CampService } from "../../shared/services/camp.service";

@Component({
  selector: 'app-outboundcdr',
  templateUrl: './outboundcdr.component.html',
  styleUrls: ['./outboundcdr.component.scss'],
  animations: [routerTransition()]
})
export class OutboundcdrComponent implements OnInit {

  dtOptions: any = {};
  dtTrigger = new Subject();
  options: NgDateRangePickerOptions;
  displayedColumns: string[] = [
    "start",
    "did",
    "src",
    "buyerName",
    "disposition",
    "duration",
    "publisherName",
    "status"
  ];
  dataSource = new MatTableDataSource<Cdr>(ELEMENT_DATA);

  grid_deleted = false;

  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;

  Cdr: Cdr[];
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
  loggedUser;
  loggedUserSettings;
  buyerNumber: any;
  selectedAudio = -1;
  constructor(
    public dialog: MatDialog,
    public router: Router,
    private myservice: CommonService,
    private publisherservice: PublisherService,
    private campservice: CampService
  ) {
    this.loggedUser = JSON.parse(localStorage.getItem("user"));
    this.loggedUserSettings = JSON.parse(
      localStorage.getItem("userSettings")
    );
  }

  ngOnInit() {
    this.dtOptions = {
      pagingType: "full_numbers",
      pageLength: 20,
      order: [[0, "desc"], [1, "desc"]],
      dom: "Bfrtip",
      buttons: ["copy", "print", "csv", "excel"]
    };

    const current = new Date().getTime();

    let str = "";

    str += "sdate=" + current + "&edate=" + current;


    if (this.loggedUser.role === "buyer") {
      this.myservice
        .get("/BuyerNumbers/getBuyerNumber/" + this.loggedUser.buyer_id)
        .subscribe(data => {
          if (data.buyerNumber) {
            let result = [];
            const qeueueArr = ['627','628'];
            data.buyerNumber.map(b => {
              if(qeueueArr.indexOf(b.number)>-1){
                result = [...result, b.number];
              }
              console.log(result,"=============")
            });
            console.log(result,"++++")
            this.buyerNumber = JSON.stringify(result);
            str += "&queue=" + this.buyerNumber;
            str += '&call_type=outbound';
            this.getCDR(str);

          }
        });
      this.selected_pub_id = 0;
    } 

    this.options = {
      theme: "default",
      range: "tm",
      dayNames: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      presetNames: [
        "This Month",
        "Last Month",
        "This Week",
        "Last Week",
        "This Year",
        "Last Year",
        "Start",
        "End"
      ],
      dateFormat: "d-M-y",
      outputFormat: "MM/DD/YYYY",
      startOfWeek: 1
      // timezone: 'cst'
    };
    this.formdata = new FormGroup({
      pub_id: new FormControl(""),
      daterange: new FormControl(""),
      camp_id: new FormControl("")
    });
    this.filteredPublishers = this.formdata.get("pub_id").valueChanges.pipe(
      debounceTime(200),
      switchMap(value => this.publisherservice.search(value))
    );

    this.filteredCamp = this.formdata.get("camp_id").valueChanges.pipe(
      debounceTime(200),
      switchMap(value =>
        this.campservice.search(value, this.selected_pub_id)
      )
    );

  }

  getCDR(str) {

    this.myservice.get("/getAllCdrs?" + str).subscribe(data => {
      this.totalcalls = data.totalcalls;
      //this.cdr = data.cdr;

      //change by ankit on 13-03-2019
      this.cdr = this.filterCalls(data.cdr);
      // console.log(this.cdr,"cdrcdrcdrcdr")

      this.dtTrigger.next();

      this.isLoadingTable = false;
    });

    // total unique calls-current date
    this.myservice.get("/getTotalUniquieCalls?" + str).subscribe(data => {
      this.totalansweredcalls = data.totalansweredcalls;
    });
    // total unique answered calls-current date
    this.myservice
      .get("/getTotalUniqueAnsweredCalls?" + str)
      .subscribe(data => {
        this.totaluniqueansweredcalls = data.totaluniqueansweredcalls;
      });
    // AHT
    this.myservice.get("/getAHT?" + str).subscribe(data => {
      if (data.aht[0] !== undefined) {
        this.aht = Math.round(data.aht[0].aht / 60);
      }
    });
  }

  filterCalls(data) {
    return data;
  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }
  hideLoader() {
    this.isLoading = false;
    const p = this.formdata.get("pub_id").value;
    this.selected_pub_id = p.uid;
  }
  showLoader() {
    this.isLoading = true;
  }

  displayFn(publisher) {
    if (publisher) {
      return publisher.fullname;
    }
  }
  displayFnCamp(campaign) {
    if (campaign) {
      return campaign.camp_name;
    }
  }

  searchWithFilter() {
    this.isLoadingTable = true;
    this.totalcalls = 0;
    this.totalansweredcalls = 0;
    this.totaluniqueansweredcalls = 0;
    this.aht = 0;

    const data = this.formdata.value;
    // console.log(data);
    if (data.pub_id.uid > 0) {
      data.pub_id = data.pub_id.uid;
    }
    if (data.camp_id.campaign_id > 0) {
      data.camp_id = data.camp_id.campaign_id;
    }
    if (data.daterange === "") {
      data.sdate = new Date().getTime();
      data.edate = new Date().getTime();
    } else {
      const dateArr = data.daterange.split("-");
      data.sdate = new Date(dateArr[0]).getTime();
      data.edate = new Date(dateArr[1]).getTime();
    }

    let str = "";
    str += "sdate=" + data.sdate + "&edate=" + data.edate;

    if (data.pub_id !== "") {
      
      str += "&pub_id=" + data.pub_id;
    }

    if (data.camp_id !== "") {

      str += "&camp_id=" + data.camp_id;
    }
    
    if (this.loggedUser.role === "buyer") {
      str += '&call_type=outbound';
      str += "&queue=" + this.buyerNumber;
    }

    this.myservice.get("/getAllCdrs?" + str).subscribe(data => {
      this.isLoadingTable = false;
      this.totalcalls = data.totalcalls;
      this.cdr = data.cdr;
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        // Destroy the table first
        dtInstance.destroy();
        // Call the dtTrigger to rerender again
        this.dtTrigger.next();
      });
    });
    // total answered calls-current date
    this.myservice.get("/getTotalUniquieCalls?" + str).subscribe(data => {
      this.totalansweredcalls = data.totalansweredcalls;
    });
    // total unique answered calls-current date

    this.myservice
      .get("/getTotalUniqueAnsweredCalls?" + str)
      .subscribe(data => {
        this.totaluniqueansweredcalls = data.totaluniqueansweredcalls;
      });
    this.myservice.get("/getAHT?" + str).subscribe(data => {
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
