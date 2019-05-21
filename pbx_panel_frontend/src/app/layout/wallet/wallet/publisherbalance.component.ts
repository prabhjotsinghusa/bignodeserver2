import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource, MatCheckboxModule, MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Router, NavigationEnd } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NgDateRangePickerOptions } from 'ng-daterangepicker';
import { routerTransition } from '../../../router.animations';
import { Publisherbalance } from "../../../shared/models/publisherbalance";
import { Deduction } from "../../../shared/models/deduction";
import { AdminTransaction } from "../../../shared/models/admintransaction"

import { Observable } from 'rxjs';
import * as moment from "moment";

import { switchMap, debounceTime, map, startWith } from 'rxjs/operators';
import { CommonService } from '../../../shared/services/common.service';
import { PublisherService } from '../../../shared/services/publisher.service';

@Component({
    selector: 'app-publisherbalance',
    templateUrl: './publisherbalance.component.html',
    styleUrls: ['./publisherbalance.component.scss'],
    animations: [routerTransition()]
})


export class PublisherBalanceComponent implements OnInit {
    options: NgDateRangePickerOptions;
    displayedColumns: string[] = ['publisherName', 'campaignName', 'total_calls',
        'qualified_calls', 'price_per_call', 'total_amount'];
    displayedColumns2: string[] = ['payment_date', 'publisherName', 'mode_payment', 'amount', 'remark', 'edit'];
    displayedColumns3: string[] = ['deduction_date', 'publisherName', 'amount', 'remarks', 'edit'];
    dataSource = new MatTableDataSource<Publisherbalance>(ELEMENT_DATA);
    dataSource2 = new MatTableDataSource<AdminTransaction>(ELEMENT_DATA2);
    dataSource3 = new MatTableDataSource<Deduction>(ELEMENT_DATA3);

    grid_deleted = false;

    @ViewChild('paging1') paginator: MatPaginator;
    @ViewChild('paging2') paginator2: MatPaginator;
    @ViewChild('paging3') paginator3: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    @ViewChild(MatSort) sort2: MatSort;
    @ViewChild(MatSort) sort3: MatSort;

    formdata;
    formdata2;
    isLoading = false;
    isLoading2 = true;
    selected_pub_id = 0;
    selected_pub_name = '';
    notification_check = false;
    isCollapsed = true;
    current_bal = 0;
    payable_amount = 0;
    show_success = false;
    success_message = `something`;
    loggedUser;
    loggedUserSettings;
    pub_id = new FormControl('');
    allPublishers: any[] = [];
    filteredPublishers: Observable<any[]>;
    ranges: any = {
        'Today': [moment(), moment()],
        'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
        'Last 7 Days': [moment().subtract(6, 'days'), moment()],
        'Last 30 Days': [moment().subtract(29, 'days'), moment()],
        'This Month': [moment().startOf('month'), moment().endOf('month')],
        'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
    };
    constructor(
        public dialog: MatDialog,
        public router: Router,
        private myservice: CommonService,
        private publisherservice: PublisherService) {
        this.loggedUser = JSON.parse(localStorage.getItem('user'));
        this.loggedUserSettings = JSON.parse(localStorage.getItem('userSettings'));
    }

    ngOnInit() {
        this.formdata = new FormGroup({
            pub_id: new FormControl(''),
            daterange: new FormControl(''),
        });
        this.formdata2 = new FormGroup({
            mode: new FormControl('', Validators.compose([
                Validators.required,
            ])),
            amount: new FormControl('', Validators.compose([
                Validators.required,
                Validators.min(1)
            ])),
            paymentDate: new FormControl(new Date(), Validators.compose([
                Validators.required,
            ])),
            remarks: new FormControl('', Validators.compose([
                Validators.required,
                Validators.minLength(1),
            ])),
        });
        let str = 'sdate=' + new Date().getTime() + '&edate=' + new Date().getTime();
        if (this.loggedUser.role === 'publisher') {
            if (!this.loggedUserSettings.display_wallet) {
                this.router.navigate(['/access-denied']);
            }
            this.selected_pub_id = this.loggedUser.uid;
            this.selected_pub_name = this.loggedUser.fullname;
            str += '&pub_id=' + this.loggedUser.uid;

            this.myservice.get('/specificPubBal?pub_id=' + this.selected_pub_id)
                .subscribe(result => {
                    if (result.publisherFinance !== undefined) {
                        const balance = result.publisherFinance;
                        this.payable_amount = balance.total_amount;
                        this.current_bal = -balance.total_amount;
                        console.log(this.payable_amount, '-----------');

                        if (balance.totaldeduction.length > 0) {
                            balance.totaldeduction.forEach(b => {
                                this.current_bal += b.total;
                            });

                        }
                        if (balance.totalpayment.length > 0) {
                            balance.totalpayment.forEach(b => {
                                this.current_bal += b.total;
                            });
                        }
                        if (balance.wallet_monthly.length > 0) {
                            balance.wallet_monthly.forEach(b => {
                                this.current_bal += b.total_amount;
                            });
                        }
                    }
                });
            /* check the notification count for the selected publisher by the admin */
            this.myservice.get('/payment_notification/getCount?status=1&pub_id=' + this.selected_pub_id)
                .subscribe(result2 => {
                    if (result2.notification_count === 0) {
                        this.notification_check = true;
                    }
                });

        } else {
            this.publisherservice.search('').subscribe(data => this.allPublishers = data.user);
            this.filteredPublishers = this.formdata.get('pub_id').valueChanges.pipe(
                startWith(null),
                map((pub: string | null) => pub ? this._filter(pub) : this.allPublishers.slice()));
        }
        this.dataSource.paginator = this.paginator;
        this.dataSource2.paginator = this.paginator;
        this.dataSource3.paginator = this.paginator;

        /* publisher Balance */
        this.myservice.get('/PublisherBalance?' + str)
            .subscribe(data => {
                this.dataSource = new MatTableDataSource<Publisherbalance>(data.publisherFinance);
                this.callafterload();
            });
        /* Admin Transaction */
        this.myservice.get('/wallet/getPaidTransaction?' + str)
            .subscribe(data => {
                this.dataSource2 = new MatTableDataSource<AdminTransaction>(data.transaction);
                this.callafterload2();
            });
        /* Deduction */
        this.myservice.get('/wallet/getDeduction?' + str)
            .subscribe(data => {
                this.dataSource3 = new MatTableDataSource<Deduction>(data.deduction);
                this.callafterload3();
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
    hideLoader() {
        this.isLoading = false;
        const p = this.formdata.get('pub_id').value;
        this.selected_pub_id = p.uid;
        this.selected_pub_name = p.fullname;
    }
    showLoader() {
        this.isLoading = true;
    }

    private _filter(value: any): any[] {

        let filterValue = '';
        if (value.fullname === undefined) {
            filterValue = value.toLowerCase();
        } else {
            filterValue = value.fullname.toLowerCase();
        }
        // console.log(filterValue, this.allPublishers);
        return this.allPublishers.filter(pub => pub.fullname.toLowerCase().indexOf(filterValue) === 0);

    }

    displayFn(publisher) {
        if (publisher) { return publisher.fullname; }
    }
    callafterload() {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.isLoading2 = false;
    }
    callafterload2() {
        this.dataSource2.paginator = this.paginator2;
        this.dataSource2.sort = this.sort2;
    }
    callafterload3() {
        this.dataSource3.paginator = this.paginator3;
        this.dataSource3.sort = this.sort3;
    }
    applyFilter(filterValue: string) {
        filterValue = filterValue.trim().toLowerCase(); // Datasource defaults to lowercase matches
        this.dataSource.filter = filterValue;
    }
    applyFilter2(filterValue: string) {
        filterValue = filterValue.trim().toLowerCase(); // Datasource defaults to lowercase matches
        this.dataSource2.filter = filterValue;
    }

    applyFilter3(filterValue: string) {
        filterValue = filterValue.trim().toLowerCase(); // Datasource defaults to lowercase matches
        this.dataSource3.filter = filterValue;
    }

    searchWithFilter() {
        this.payable_amount = 0;
        this.current_bal = 0;
        this.isLoading2 = true;
        this.notification_check = false;
        const data = this.formdata.value;

        if (data.daterange !== undefined && data.daterange.start !== undefined && data.daterange.end !== undefined) {
            data.sdate = new Date(data.daterange.start.format('YYYY-MM-DD')).getTime();
            data.edate = new Date(data.daterange.end.format('YYYY-MM-DD')).getTime();
        } else {
            data.sdate = Date.now();
            data.sdate = new Date(data.sdate).getTime();
            data.edate = Date.now();
            data.edate = new Date(data.edate).getTime();

        }

        let str = '';
        str += 'sdate=' + data.sdate + '&edate=' + data.edate;

        if (data.pub_id.uid > 0) {
            str += '&pub_id=' + data.pub_id.uid;
        }
        if (this.loggedUser.role === 'publisher') {
            str += '&pub_id=' + this.loggedUser.uid;
        }

        /* publisher balance */
        this.myservice.get('/PublisherBalance?' + str)
            .subscribe(result => {
                this.dataSource = new MatTableDataSource<Publisherbalance>(result.publisherFinance);
                this.callafterload();
            });
        /* Admin Transaction */
        this.myservice.get('/wallet/getPaidTransaction?' + str)
            .subscribe(result => {
                this.dataSource2 = new MatTableDataSource<AdminTransaction>(result.transaction);
                this.callafterload2();
            });
        /* Deduction */
        this.myservice.get('/wallet/getDeduction?' + str)
            .subscribe(result => {
                this.dataSource3 = new MatTableDataSource<Deduction>(result.deduction);
                this.callafterload3();
            });

        /* Specific Publisher Total Balance */
        if (this.selected_pub_id > 0) {
            this.myservice.get('/specificPubBal?pub_id=' + this.selected_pub_id)
                .subscribe(result => {

                    if (result.publisherFinance !== undefined) {
                        const balance = result.publisherFinance;
                        this.payable_amount = balance.total_amount;
                        this.current_bal = -balance.total_amount;
                        console.log(this.payable_amount, '-----------');

                        if (balance.totaldeduction.length > 0) {
                            balance.totaldeduction.forEach(b => {
                                this.current_bal += b.total;
                            });

                        }
                        if (balance.totalpayment.length > 0) {
                            balance.totalpayment.forEach(b => {
                                this.current_bal += b.total;
                            });
                        }
                        if (balance.wallet_monthly.length > 0) {
                            balance.wallet_monthly.forEach(b => {
                                this.current_bal += b.total_amount;
                            });
                        }
                    }
                });
            const payment_notification_str = '/payment_notification/getCount?status=1&pub_id=' + this.selected_pub_id;

            this.myservice.get(payment_notification_str)
                .subscribe(result2 => {
                    if (result2.notification_count) {
                        this.notification_check = true;
                    }
                    if (this.loggedUser.role === 'publisher' && result2.notification_count === 0) {
                        this.notification_check = true;
                    }
                });


        }

    }
    deleteTransaction(id) {
        if (confirm('Are your to delete the record?')) {
            console.log('delete the transaction', id);
            let index = -1;
            this.dataSource2.data.forEach((row, i) => {
                if (row['_id'] === id) {
                    index = i;
                }
            });
            if (index > -1) {
                this.myservice.delete('/wallet/deleteTransaction/' + id).subscribe(
                    data => {
                        if (data.success === 'OK') {
                            this.show_success = true;
                            this.success_message = data.message;
                            this.dataSource2.data.splice(index, 1);
                            this.dataSource2 = new MatTableDataSource<AdminTransaction>(this.dataSource2.data);
                            this.callafterload2();
                        }
                    },
                    err => {
                        console.log(err);
                    });
            }
        }
    }
    deleteDeduction(id) {
        if (confirm('Are your to delete the record?')) {
            console.log('delete the deduction', id);
            let index = -1;
            this.dataSource3.data.forEach((row, i) => {
                if (row['_id'] === id) {
                    index = i;
                }
            });
            if (index > -1) {
                this.myservice.delete('/wallet/deleteDeduction/' + id).subscribe(
                    data => {
                        if (data.success === 'OK') {
                            this.show_success = true;
                            this.success_message = data.message;
                            this.dataSource3.data.splice(index, 1);
                            this.dataSource3 = new MatTableDataSource<Deduction>(this.dataSource3.data);
                            this.callafterload3();
                        }
                    },
                    err => {
                        console.log(err);
                    });
            }
        }
    }
    addPayment() {
        console.log(this.selected_pub_id, 'send publisher money');
        if (!this.formdata2.invalid) {
            let publishers = [];
            const data = this.formdata2.value;
            data.paymentDate = moment(data.paymentDate).format('YYYY-MM-DD HH:mm:ss');
            publishers.push({ uid: this.selected_pub_id, fullname: this.selected_pub_name });
            data.publishers = publishers;
            console.log(data);
            this.myservice.post('/wallet/addPublisherBalance/', data)
                .subscribe(
                    result => {
                        if (result.success === 'OK') {
                            this.show_success = true;
                            this.success_message = `Payment is added successfully for the publisher.`;
                            this.formdata2.reset();
                            publishers = [];
                            this.isCollapsed = true;
                            this.myservice.get('/specificPubBal?pub_id=' + this.selected_pub_id)
                                .subscribe(result3 => {

                                    if (result.publisherFinance !== undefined) {
                                        const balance = result.publisherFinance;
                                        this.payable_amount = balance.total_amount;
                                        this.current_bal = -balance.total_amount;
                                        console.log(this.payable_amount, '-----------');

                                        if (balance.totaldeduction.length > 0) {
                                            balance.totaldeduction.forEach(b => {
                                                this.current_bal += b.total;
                                            });

                                        }
                                        if (balance.totalpayment.length > 0) {
                                            balance.totalpayment.forEach(b => {
                                                this.current_bal += b.total;
                                            });
                                        }
                                        if (balance.wallet_monthly.length > 0) {
                                            balance.wallet_monthly.forEach(b => {
                                                this.current_bal += b.total_amount;
                                            });
                                        }
                                    }
                                });
                            /* check the notification count for the selected publisher by the admin */
                            this.myservice.get('/payment_notification/getCount?status=0&pub_id' + this.selected_pub_id)
                                .subscribe(result2 => {
                                    if (result2.notification_count) {
                                        this.notification_check = false;
                                    } else {
                                        this.notification_check = true;
                                    }
                                });

                        }
                    },
                    err => {
                        console.log(err, 'error');
                    }
                );
        }
    }
    closePopup() {
        this.isCollapsed = true;
    }
    sendNotification() {
        console.log(this.selected_pub_id, 'send notificatiaon');
        this.myservice.get('/payment_notification/add?pub_id=' + this.selected_pub_id)
            .subscribe(result => {
                if (result.notification) {
                    this.success_message = `Payment notification is send successfully.`;
                    this.show_success = true;
                    this.notification_check = false;
                }
            });
    }
}

const ELEMENT_DATA: Publisherbalance[] = [];
const ELEMENT_DATA2: AdminTransaction[] = [];
const ELEMENT_DATA3: Deduction[] = [];
