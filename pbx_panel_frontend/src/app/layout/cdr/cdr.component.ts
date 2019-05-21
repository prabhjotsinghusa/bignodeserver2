import { Component, OnInit, ViewChild, Input } from '@angular/core';
import {
    MatTableDataSource,
    MatDialog,
} from '@angular/material';
import { Router, NavigationEnd } from '@angular/router';
import { NgDateRangePickerOptions } from 'ng-daterangepicker';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Observable, iif } from 'rxjs';
import { Subject } from 'rxjs';
import { switchMap, debounceTime } from 'rxjs/operators';
import { DataTableDirective } from 'angular-datatables';
import * as moment from "moment";
import { routerTransition } from '../../router.animations';
import { Cdr } from '../../shared/models/cdr';
import { CommonService } from '../../shared/services/common.service';
import { PublisherService } from '../../shared/services/publisher.service';
import { CampService } from '../../shared/services/camp.service';



@Component({
    selector: 'app-cdr',
    templateUrl: './cdr.component.html',
    styleUrls: ['./cdr.component.scss'],
    animations: [routerTransition()]
})
export class CdrComponent implements OnInit {
    dtOptions: any = {};
    dtTrigger = new Subject();
    options: NgDateRangePickerOptions;
    displayedColumns: string[] = [
        'start',
        'did',
        'src',
        'buyerName',
        'disposition',
        'duration',
        'publisherName',
        'status'
    ];
    dataSource = new MatTableDataSource<Cdr>(ELEMENT_DATA);
    ranges: any = {
        'Today': [moment(), moment()],
        'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
        'Last 7 Days': [moment().subtract(6, 'days'), moment()],
        'Last 30 Days': [moment().subtract(29, 'days'), moment()],
        'This Month': [moment().startOf('month'), moment().endOf('month')],
        'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
    };
    //daterange: any;

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
    loggedUser: any;
    loggedUserSettings: any;
    buyerNumber: any;
    selectedAudio = -1;
    rowView = -1;
    constructor(
        public dialog: MatDialog,
        public router: Router,
        private myservice: CommonService,
        private publisherservice: PublisherService,
        private campservice: CampService
    ) {
        this.loggedUser = JSON.parse(localStorage.getItem('user'));
        this.loggedUserSettings = JSON.parse(
            localStorage.getItem('userSettings')
        );
    }

    ngOnInit() {
        this.dtOptions = {
            pagingType: 'full_numbers',
            pageLength: 20,
            order: [[1, 'desc'], [2, 'desc']],
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

        const current = new Date().getTime();

        let str = '';
        str += 'sdate=' + current + '&edate=' + current;

        if (this.loggedUser.role === 'publisher') {
            this.selected_pub_id = this.loggedUser.uid;
            str += '&pub_id=' + this.loggedUser.uid;
            str += '&status=show';
        }
        if (this.loggedUser.role === 'buyer') {
            this.myservice
                .get('/BuyerNumbers/getBuyerNumber/' + this.loggedUser.buyer_id)
                .subscribe(data => {
                    if (data.buyerNumber) {
                        let result = [];
                        data.buyerNumber.map(b => {
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

        this.options = {
            theme: 'default',
            range: 'tm',
            dayNames: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            presetNames: [
                'This Month',
                'Last Month',
                'This Week',
                'Last Week',
                'This Year',
                'Last Year',
                'Start',
                'End',
                'Today',
                'Yesterday'
            ],
            dateFormat: 'd-M-y',
            outputFormat: 'MM/DD/YYYY',
            startOfWeek: 1
            // timezone: 'cst'
        };
        this.formdata = new FormGroup({
            pub_id: new FormControl(''),
            daterange: new FormControl(''),
            camp_id: new FormControl(''),
            buffer_time: new FormControl(''),
        });
        this.filteredPublishers = this.formdata.get('pub_id').valueChanges.pipe(
            debounceTime(200),
            switchMap(value => this.publisherservice.search(value))
        );

        this.filteredCamp = this.formdata.get('camp_id').valueChanges.pipe(
            debounceTime(200),
            switchMap(value =>
                this.campservice.search(value, this.selected_pub_id)
            )
        );
    }
    getCDR(str) {
        this.myservice.get('/getAllCdrs?' + str).subscribe(data => {
            this.totalcalls = data.totalcalls;
            this.cdr = data.cdr;
            this.dtTrigger.next();
            this.isLoadingTable = false;
        });

        // total unique calls-current date
        this.myservice.get('/getTotalUniquieCalls?' + str).subscribe(data => {
            this.totalansweredcalls = data.totalansweredcalls;
        });
        // total unique answered calls-current date
        this.myservice
            .get('/getTotalUniqueAnsweredCalls?' + str)
            .subscribe(data => {
                this.totaluniqueansweredcalls = data.totaluniqueansweredcalls;
            });
        // AHT
        this.myservice.get('/getAHT?' + str).subscribe(data => {
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
        console.log(data);
        if (data.pub_id.uid > 0) {
            data.pub_id = data.pub_id.uid;
        }
        if (data.camp_id.campaign_id > 0) {
            data.camp_id = data.camp_id.campaign_id;
        }

        let str = '';
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
        if (data.camp_id !== '') {
            str += '&camp_id=' + data.camp_id;
        }
        if (this.loggedUser.role === 'publisher') {
            this.selected_pub_id = this.loggedUser.uid;
            str += '&pub_id=' + this.loggedUser.uid;
            str += '&status=show';
            if (data.buffer_time !== '') {
                str += '&buffer_time=' + data.buffer_time;
            }
        }

        if (this.loggedUser.role === 'buyer') {
            str += '&buyerNumber=' + this.buyerNumber;
        }

        this.myservice.get('/getAllCdrs?' + str).subscribe(data => {
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
        this.myservice.get('/getTotalUniquieCalls?' + str).subscribe(data => {
            this.totalansweredcalls = data.totalansweredcalls;
        });
        // total unique answered calls-current date

        this.myservice
            .get('/getTotalUniqueAnsweredCalls?' + str)
            .subscribe(data => {
                this.totaluniqueansweredcalls = data.totaluniqueansweredcalls;
            });
        this.myservice.get('/getAHT?' + str).subscribe(data => {
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
    blockNumber(element) {
        if (element) {
            if (element.callerid_blocked) {
                element.callerid_blocked = false;
            } else {
                element.callerid_blocked = true;
            }
            console.log(element.src);
            this.myservice.post('/cdr/blacklist', { num: '8561841501' }).subscribe(data => {
                if (data.success === 'OK') {
                    console.log('customer number is blocked success fully.');
                }
            });
        }

    }

    viewDetail(row, element) {
        let html = `<tr class="mat-row ng-tns-c4-0 ng-star-inserted" id="rowDetails">
        <td class="mat-cell ng-star-inserted" colspan="11"
            style="position:relative !important; width:500px; border:1px solid;background: #eaeaea;">
        <div class="hide_field container p-2 mt-2 mb-2">
            <table class="table table-bordered">
                <thead>
                    <tr>
                        <th width="20%">Name</th>
                        <th>Value</th>
                    </tr>
                </thead>
                <tbody>`;
        if (element.concern !== undefined) {
            if (element.concern === 'Other') {
                html += `<tr>
            <td>Concern</td>
            <td>Other</td>
        </tr><tr>
            <td>Remark</td>
            <td>${element.remark}</td>
        </tr>`;
            } else {
                html += `<tr>
                <td>Concern</td>
                <td>${element.concern}</td>
            </tr>`;
            }
        } else {
            html += `<tr>
                    <td>Concern</td>
                    <td>-NA-</td>
                </tr>`;
        }

        html += `<tr>
                        <td>Call Date & Time</td>
                        <td>${element.start}</td>
                    </tr>
                    <tr>
                        <td>TFN</td>
                        <td>${element.did}</td>
                    </tr>
                    <tr>
                        <td>Customer Number</td>
                        <td>`;
        if (this.loggedUser.role === 'publisher' && !this.loggedUserSettings.display_cnum) {
            html += 'xxxx-xxx-' + element.src.substr(-4);
        } else {
            html += element.src;
        }
        html += `</td></tr> <tr>
        <td>Disposition</td>
        <td>${element.disposition}</td>
    </tr>
    <tr>
        <td>Duration</td>
        <td>${element.duration}</td>
    </tr>`;
        if (this.loggedUser.role === 'admin') {
            html += `<tr>
            <td>Publisher</td>
            <td>${element.publisherName}</td>
        </tr>
        <tr>
            <td>Status</td>
            <td>${element.status}</td>
        </tr>`;
        }
        if (this.loggedUser.role === 'admin' || (this.loggedUser.role === 'publisher' && this.loggedUserSettings.show_buyer_no)) {
            html += `<tr>
            <td>Buyer Number </td>
                <td>${element.buyer_id}</td>
        </tr>`;
        }
        if (this.loggedUser.role === 'admin') {
            html += `<tr>
        <td>Total Cost</td>
            <td>`;
            if (element.wallet_status === 'no') {
                html += element.price_per_tfn;
            } else {
                html += Math.ceil(element.charge_per_minute * element.duration / 60);
            }
            html += `</td></tr>`;
            html += `</tbody>
            </table>
        </div>
        </td>
    </tr>`;
        }
        $('#rowDetails').remove();
        const id = '#rowtd' + row;
        if (this.rowView === row) {
            this.rowView = -1;
            $('#rowDetails').remove();
        } else {
            this.rowView = row;
            $(id).closest('tr').after(html);
        }
    }
}
const ELEMENT_DATA: Cdr[] = [];
