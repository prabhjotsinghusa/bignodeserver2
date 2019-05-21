import { Component, OnInit, ViewChild, Input } from '@angular/core';
import {
    MatPaginator, MatSort, MatTableDataSource, MatCheckboxModule, MatDialog,
    MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA
} from '@angular/material';
import { Router, NavigationEnd } from '@angular/router';
import { NgDateRangePickerOptions } from 'ng-daterangepicker';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs';
import { switchMap, debounceTime } from 'rxjs/operators';
import { DataTableDirective } from 'angular-datatables';
import * as moment from 'moment';

import { routerTransition } from '../../router.animations';

import { CommonService } from '../../shared/services/common.service';
import { PublisherService } from '../../shared/services/publisher.service';
import { CampService } from '../../shared/services/camp.service';
import { RealtimeService } from '../../shared/services/realtime.service';

@Component({
    selector: 'app-auditreport',
    templateUrl: './auditreport.component.html',
    styleUrls: ['./auditreport.component.scss'],
    animations: [routerTransition()]
})

export class AuditreportComponent implements OnInit {
    dtOptions: any = {};
    dtTrigger = new Subject();
    options: NgDateRangePickerOptions;

    grid_deleted = false;

    @ViewChild(DataTableDirective)
    dtElement: DataTableDirective;

    formdata;
    error = false;
    error_message = `Some error occur.`;
    isLoading = false;
    isLoadingcamp = false;
    isLoadingTable = true;
    isLoadingTextarea = false;
    edit_audit_profile_id = 0;
    filteredPublishers: Observable<any>;
    assignPublisher: any;
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
    hiddenConcern = -1;
    selected_index = -1;
    ranges: any = {
        'Today': [moment(), moment()],
        'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
        'Last 7 Days': [moment().subtract(6, 'days'), moment()],
        'Last 30 Days': [moment().subtract(29, 'days'), moment()],
        'This Month': [moment().startOf('month'), moment().endOf('month')],
        'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
    };
    concernOption = ['Test Call', 'Customer Hung up', 'Prank', 'Call Dropped', 'Popup', 'No Response',
        'Missed', 'VMU', 'Wrong Number', 'IVR', 'Inquiry', 'Not Playing', 'No Voice', 'Out of Scope', 'No Recording',
        'An Error has occurred with call Forwarding', 'No Response From Agent', 'Other'
    ];
    constructor(public dialog: MatDialog, public router: Router, private myservice: CommonService,
        private publisherservice: PublisherService, private realtimeservice: RealtimeService) {
        this.loggedUser = JSON.parse(localStorage.getItem('user'));
        this.loggedUserSettings = JSON.parse(localStorage.getItem('userSettings'));
    }

    ngOnInit() {
        this.edit_audit_profile_id = this.loggedUser.uid;
        this.dtOptions = {
            pagingType: 'full_numbers',
            pageLength: 20,
            order: [[0, 'desc'], [1, 'desc']],
            dom: 'Bfrtip',
            buttons: [
                {
                    extend: 'copy',
                    title: 'Cdr'
                },
                {
                    extend: 'print',
                    title: 'Cdr'
                },
                {
                    extend: 'csv',
                    title: 'Cdr'
                },
                {
                    extend: 'excel',
                    title: 'Cdr'
                }
            ],
        };

        const current = (new Date()).getTime();

        let str = 'call_type=inbound&';
        str += 'sdate=' + current + '&edate=' + current;
        this.options = {
            theme: 'default',
            range: 'tm',
            dayNames: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            presetNames: ['This Month', 'Last Month', 'This Week', 'Last Week', 'This Year', 'Last Year', 'Start', 'End'],
            dateFormat: 'd-M-y',
            outputFormat: 'MM/DD/YYYY',
            startOfWeek: 1,
            // timezone: 'cst'
        };
        this.formdata = new FormGroup({
            pub_id: new FormControl(''),
            daterange: new FormControl(''),
            call_type: new FormControl('inbound')
        });
        this.filteredPublishers = this.formdata.get('pub_id').valueChanges.pipe(
            debounceTime(200),
            switchMap(value => this.myservice.search('/publisher/getAssignedPublisher/' + this.edit_audit_profile_id, value))
        );
        this.myservice.get('/publisher/getAssignedPublisher/' + this.edit_audit_profile_id).subscribe(
            data => {
                let publishers = data.user;
                publishers = publishers.map(p => p = p.pub_id);
                this.assignPublisher = publishers;
                str += '&pubArr=' + JSON.stringify(this.assignPublisher);
                this.getCDR(str);
            }, err => {
                console.log(err);
            }
        );
    }
    getCDR(str) {
        this.myservice.get('/getAllCdrs?' + str)
            .subscribe(data => {
                this.totalcalls = data.totalcalls;
                this.cdr = data.cdr;
                this.dtTrigger.next();
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
    }
    ngOnDestroy(): void {
        // Do not forget to unsubscribe the event
        this.dtTrigger.unsubscribe();
    }
    hideLoader() {
        this.isLoading = false;
        const p = this.formdata.get('pub_id').value;
        this.selected_pub_id = p.pub_id;
    }
    showLoader() {
        this.isLoading = true;
    }

    displayFn(publisher) {
        if (publisher) { return publisher.fullname; }
    }

    searchWithFilter() {
        this.isLoadingTable = true;
        this.totalcalls = 0;
        this.totalansweredcalls = 0;
        this.totaluniqueansweredcalls = 0;
        this.aht = 0;

        const data = this.formdata.value;
        // console.log(data);
        if (data.pub_id.pub_id > 0) {
            data.pub_id = data.pub_id.pub_id;
        }
        /*  if (data.camp_id.campaign_id > 0) {
             data.camp_id = data.camp_id.campaign_id;
         } */

        let str = '';
        str += '&pubArr=' + JSON.stringify(this.assignPublisher);
        if (data.daterange !== undefined && data.daterange.start !== undefined && data.daterange.end !== undefined) {
            const sdate = new Date(data.daterange.start.format('YYYY-MM-DD')).getTime();
            const edate = new Date(data.daterange.end.format('YYYY-MM-DD')).getTime();
            str = 'sdate=' + sdate + '&edate=' + edate;
        } else {
            const currentDate = new Date().getTime();
            str = 'sdate=' + currentDate + '&edate=' + currentDate;
        }
        if (data.pub_id !== '') {
            str += '&pub_id=' + data.pub_id;
        }
        if (data.call_type !== '') {
            str += '&call_type=' + data.call_type;
        }


        this.myservice.get('/getAllCdrs?' + str)
            .subscribe(data => {
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
        this.myservice.get('/getTotalUniquieCalls?' + str)
            .subscribe(data => {
                this.totalansweredcalls = data.totalansweredcalls;
            });
        // total unique answered calls-current date

        this.myservice.get('/getTotalUniqueAnsweredCalls?' + str)
            .subscribe(data => {
                this.totaluniqueansweredcalls = data.totaluniqueansweredcalls;
            });
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
    viewConcern(i) {
        if (this.hiddenConcern === i) {
            this.hiddenConcern = -1;
            this.selected_index = -1;
        } else {
            this.hiddenConcern = i;
            this.selected_index = i;
        }
    }
    addConcern(event, element) {
        this.isLoadingTextarea = true;
        const data: any = {};
        data.id = element['_id'];
        data.concern = element.concern = event.target.value.trim();

        if (data.concern !== '' && data.concern !== 'Other') {
            this.toServer(data);
        }
    }
    addRemark(event, element) {
        const data: any = {};
        data.id = element['_id'];
        data.concern = element.concern = 'Other';
        data.remark = element.remark = event.target.value.trim();

        if (data.remark !== '') {
            this.toServer(data);
        }
    }
    toServer(data) {
        this.realtimeservice.post('https://client.pbx4you.com:8444/cdr/addConcern', data).subscribe(res => {
            if (res.data) {
                this.hiddenConcern = -1;
                this.selected_index = -1;
                this.isLoadingTextarea = false;
            }
        });
    }
}

