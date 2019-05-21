
import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource, MatDialog } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { NgDateRangePickerOptions } from 'ng-daterangepicker';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs';
import { Subscription } from 'rxjs/Subscription';
import { DataTableDirective } from 'angular-datatables';
import { routerTransition } from '../../router.animations';

import { CommonService } from '../../shared/services/common.service';
import { PublisherService } from '../../shared/services/publisher.service';
import { CampService } from '../../shared/services/camp.service';

@Component({
  selector: 'app-audio',
  templateUrl: './audio.component.html',
  styleUrls: ['./audio.component.scss'],
  animations: [routerTransition()]
})

export class AudioComponent implements OnInit {

  dtOptions: any = {};
  dtTrigger = new Subject();
  options: NgDateRangePickerOptions;

  grid_deleted = false;

  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;

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
  audioReport;
  totaluniqueansweredcalls = 0;
  aht = 0;
  loggedUser;
  loggedUserSettings;
  buyerSub: Subscription;
  pub_id: any;
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

  }

  ngOnInit() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 20,
      dom: 'Bfrtip',
      buttons: [
        {
          extend: 'copy',
          title: 'Audio'
        },
        {
          extend: 'print',
          title: 'Audio'
        },
        {
          extend: 'csv',
          title: 'Audio'
        },
        {
          extend: 'excel',
          title: 'Audio'
        }
      ],
    };

    this.formdata = new FormGroup(
      {
        date: new FormControl(''),
        name: new FormControl(''),
        fileName: new FormControl('')
      });

    let str = '/audio/fetchAudio?';

    if (this.loggedUser.role === 'buyer') {
      str += 'buyer_id=' + this.loggedUser.buyer_id;
    }
    this.myservice.get(str)
      .subscribe(data => {
        this.audioReport = data.audio;
        this.dtTrigger.next();
        this.isLoadingTable = false;
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

  // ngAfterViewInit(): void { this.dtTrigger.next(); }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
    //this.buyerSub.unsubscribe();
  }

  hideLoader() {
    this.isLoading = false;
    const p = this.formdata.get('pub_id').value;
    this.selected_pub_id = p.uid;
  }
  showLoader() {
    this.isLoading = true;
  }

  showAudio(i) {
    if (this.selectedAudio === i) {
      this.selectedAudio = -1;
    } else {
      this.selectedAudio = i;
    }
  }
}
