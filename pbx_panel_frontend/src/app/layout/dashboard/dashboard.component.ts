import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource, MatCheckboxModule } from '@angular/material';
import { Router, NavigationEnd } from '@angular/router';
import { NgDateRangePickerOptions } from 'ng-daterangepicker';


import { Moment } from 'moment';
import * as moment from "moment";

import { routerTransition } from '../../router.animations';
import { CommonService } from '../../shared/services/common.service';
import { RealtimeService } from '../../shared/services/realtime.service';
import { AdminTransaction } from "../../shared/models/admintransaction";

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    animations: [routerTransition()]
})
export class DashboardComponent implements OnInit {
    displayedColumns: string[] = ['payment_date', 'publisherName', 'mode_payment', 'amount', 'remark', 'edit'];
    dataSource = new MatTableDataSource<AdminTransaction>(ELEMENT_DATA);

    totalcalls = 0;
    totaluniquecalls = 0;
    totalansweredcalls = 0;
    totaluniqueansweredcalls = 0;
    aht = 0;
    payablecalls = 0;
    payableamount = 0;
    realtimecount = 0;
    maxPub = '-NA-';
    calls_chart_title = 'Hourly';

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    loggedUser: any;
    loggedUserSettings: any;
    intervalVar: any;
    assignedPublisher: any;
    options: NgDateRangePickerOptions;

    ranges: any = {
        'Today': [moment(), moment()],
        'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
        'Last 7 Days': [moment().subtract(6, 'days'), moment()],
        'Last 30 Days': [moment().subtract(29, 'days'), moment()],
        'This Month': [moment().startOf('month'), moment().endOf('month')],
        'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
    };
    daterange: any;

    constructor(public router: Router, private myservice: CommonService, private realTimeService: RealtimeService) {
        this.loggedUser = JSON.parse(localStorage.getItem('user'));
        this.loggedUserSettings = JSON.parse(localStorage.getItem('userSettings'));
    }

    // bar chart
    public barChartOptions: any = {
        scaleShowVerticalLines: false,
        responsive: true
    };
    public barChartLabels: string[] = [
        '2006',
        '2007',
        '2008',
        '2009',
        '2010',
        '2011',
        '2012'
    ];
    public barChartType: string = 'bar';
    public barChartLegend: boolean = true;

    public barChartData: any[] = [
        { data: [65, 59, 80, 81, 56, 55, 40], label: 'Series A' },
        { data: [28, 48, 40, 19, 86, 27, 90], label: 'Series B' }
    ];

    // Doughnut
    public doughnutChartLabels: string[] = [
        'Download Sales',
        'In-Store Sales',
        'Mail-Order Sales'
    ];
    public doughnutChartData: number[] = [350, 450, 100];
    public doughnutChartType: string = 'doughnut';

    // Radar
    public radarChartLabels: string[] = [
        'Eating',
        'Drinking',
        'Sleeping',
        'Designing',
        'Coding',
        'Cycling',
        'Running'
    ];
    public radarChartData: any = [
        { data: [65, 59, 90, 81, 56, 55, 40], label: 'Series A' },
        { data: [28, 48, 40, 19, 96, 27, 100], label: 'Series B' }
    ];
    public radarChartType: string = 'radar';

    // Pie
    public pieChartLabels: string[] = [
        'Publishers',
        'Buyers',
        'TFNs'
    ];
    public pieChartData: number[] = [0, 0, 0];
    public pieChartType: string = 'pie';

    // PolarArea
    public polarAreaChartLabels: string[] = [
        'Download Sales',
        'In-Store Sales',
        'Mail Sales',
        'Telesales',
        'Corporate Sales'
    ];
    public polarAreaChartData: number[] = [300, 500, 100, 40, 120];
    public polarAreaLegend: boolean = true;

    public polarAreaChartType: string = 'polarArea';

    // lineChart
    public lineChartData: Array<any> = [
        { data: [65, 59, 80, 81, 56, 55, 40], label: 'Total Calls' },
        { data: [28, 48, 40, 19, 86, 27, 90], label: 'Total Unique Calls' },
        { data: [18, 48, 77, 9, 100, 27, 40], label: 'Total Unique Answered Calls' },
        { data: [18, 2, 55, 9, 10, 3, 40], label: 'AHT' }
    ];
    public lineChartLabels: Array<any> = [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday'
    ];
    public lineChartOptions: any = {
        responsive: true
    };
    public lineChartColors: Array<any> = [
        {
            // grey total calls
            backgroundColor: 'rgba(0,0,0,0.0)',
            borderColor: 'rgb(52, 73, 94)',
            pointBackgroundColor: 'rgb(52, 73, 94)',
            pointBorderColor: 'rgb(52, 73, 94)',
            pointHoverBackgroundColor: 'rgb(52, 73, 94)',
            pointHoverBorderColor: 'rgb(52, 73, 94);',
            pointHitRadius: 100,
            borderWidth: 4,
            pointBorderWidth: 3
        },
        {
            // dark grey total unique calls
            backgroundColor: 'rgba(0,0,0,0.0)',
            borderColor: 'rgb(243, 156, 18)',
            pointBackgroundColor: 'rgb(243, 156, 18)',
            pointBorderColor: 'rgb(243, 156, 18)',
            pointHoverBackgroundColor: 'rgb(243, 156, 18)',
            pointHoverBorderColor: 'rgb(243, 156, 18)',
            borderWidth: 4,
            pointBorderWidth: 3

        },
        {
            // green total unique a call
            backgroundColor: 'rgba(0,0,0,0.0)',
            borderColor: 'rgb(41, 128, 185)',
            pointBackgroundColor: 'rgb(41, 128, 185)',
            pointBorderColor: 'rgb(41, 128, 185)',
            pointHoverBackgroundColor: 'rgb(41, 128, 185)',
            pointHoverBorderColor: 'rgb(41, 128, 185)',
            borderWidth: 4,
            pointBorderWidth: 3

        },
        {
            // dark grey
            backgroundColor: 'rgba(0,0,0,0.0)',
            borderColor: 'rgb(255, 25, 0)',
            pointBackgroundColor: 'rgb(255, 25, 0)',
            pointBorderColor: 'rgb(255, 25, 0)',
            pointHoverBackgroundColor: 'rgb(255, 25, 0',
            pointHoverBorderColor: 'rgb(255, 25, 0)',
            borderWidth: 4,
            pointBorderWidth: 3

        },
    ];
    public lineChartLegend: boolean = true;
    public lineChartType: string = 'line';

    // events
    public chartClicked(e: any): void {
        // console.log(e);
    }

    public chartHovered(e: any): void {
        // console.log(e);
    }

    public randomize(): void {
        // Only Change 3 values
        const data = [
            Math.round(Math.random() * 100),
            59,
            80,
            Math.random() * 100,
            56,
            Math.random() * 100,
            40
        ];
        const clone = JSON.parse(JSON.stringify(this.barChartData));
        clone[0].data = data;
        this.barChartData = clone;
        /**
         * (My guess), for Angular to recognize the change in the dataset
         * it has to change the dataset variable directly,
         * so one way around it, is to clone the data, change it and then
         * assign it;
         */
    }

    ngOnInit() {
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
                'End'
            ],
            dateFormat: 'd-M-y',
            outputFormat: 'MM/DD/YYYY',
            startOfWeek: 1
            // timezone: 'cst'
        };
        if (this.loggedUser.role === 'buyer') {
            const buyerArr = [454]; /* array for buyer dashboard */
            if (buyerArr.indexOf(this.loggedUser.buyer_id) > -1) {
                this.router.navigate(['buyerdashboard']);
            } else {
                if (this.loggedUser.buyer_id === 453) {
                    this.router.navigate(['buyermonitoring/627/FR']);
                } else {
                    this.router.navigate(['cdr']);
                }
            }
        }
        if (this.loggedUser.role === 'audit_profile') {
            this.myservice.get('/publisher/getAssignedPublisher/' + this.loggedUser.uid).subscribe(
                data => {
                    let publishers = data.user;
                    publishers = publishers.map(p => p = p.pub_id);
                    this.assignedPublisher = publishers;
                    this.refreshCalls();
                    this.refreshTransaction();
                    this.refreshHourly();
                }, err => {
                    console.log(err);
                }
            );
        } else {
            this.refreshCalls();
            this.refreshTransaction();
            this.refreshHourly();
        }
        this.refreshPie();

        const that = this;
        this.intervalVar = setInterval(() => {
            // that.realtimeCount();
        }, 5000);
    }
    dateChange() {
        if (this.daterange !== undefined) {
            this.refreshCalls();
            this.refreshTransaction();
        }
    }

    ngOnDestroy() {
        // console.log('while leaving the destroy');
        clearInterval(this.intervalVar);
    }
    /* dashboard realtime count */
    public realtimeCount() {
        const str = 'https://portal.pbx4you.com/realtime.php?hasher=U3VjY2Vzcw';

        this.realTimeService.get(str)
            .subscribe(data => {
                let d = data;

                if (this.loggedUser.role === 'publisher') {
                    d = this.publisher(data);
                }
                this.realtimecount = d.length;
            });
    }
    publisher(data) {
        return data.filter(value => {
            if (value.status === 'show' && parseInt(value.queue) === this.loggedUser.uid) {
                return true;
            }
        });
    }
    public refreshCalls() {
        /* CST timezone in the frontend */
        // const current = (new Date((new Date()).toLocaleString("en-US", { timeZone: 'America/Chicago' }))).getTime();
        const current = (new Date()).getTime();
        let str = '';
        str += 'sdate=' + current + '&edate=' + current;

        if (this.daterange !== undefined && this.daterange.start !== undefined && this.daterange.end !== undefined &&
            this.daterange.start !== null) {
            const sdate = new Date(this.daterange.start.format('YYYY-MM-DD')).getTime();
            const edate = new Date(this.daterange.end.format('YYYY-MM-DD')).getTime();
            str = 'sdate=' + sdate + '&edate=' + edate;
        }

        if (this.loggedUser.role === 'publisher') {
            str += '&pub_id=' + this.loggedUser.uid;
            str += '&status=show';
        }
        if (this.loggedUser.role === 'audit_profile') {
            str += '&call_type=inbound' + this.loggedUser.uid;
            str += '&pubArr=' + JSON.stringify(this.assignedPublisher);
        }

        // total unique calls-current date
        this.myservice.get('/getTotalCalls?' + str)
            .subscribe(data => {
                this.totalcalls = data.totalcalls;
            });
        // total unique calls-current date
        this.myservice.get('/getTotalUniquieCalls?' + str)
            .subscribe(data => {
                this.totaluniquecalls = data.totalansweredcalls;
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
        /* payable Calls and payable amount */
        this.myservice.get('/getPublisherBalanceTotal?' + str)
            .subscribe(data => {
                this.payablecalls = 0;
                this.payableamount = 0;
                if (data.publisherFinance.length > 0) {
                    data.publisherFinance.map((item) => {
                        if (item.d !== undefined) {
                            this.payablecalls += item.d.payablecalls;
                            this.payableamount += item.d.totalamount;
                        }

                    });
                }
            });
        if (this.loggedUser.role === 'admin' || this.loggedUser.role === 'director') {
            this.myservice.get('/cdr/maxTfnCall?' + str)
                .subscribe(d => {
                    if (d.data) {
                        this.maxPub = d.data;
                    }
                });
        }

    }

    public refreshWeekly() {
        this.calls_chart_title = 'Weekly';
        /* CST timezone in the frontend */
        // const current = (new Date((new Date()).toLocaleString("en-US", { timeZone: 'America/Chicago' }))).getTime();
        let weekdays = [];
        const curr = new Date;
        const first = curr.getDate() - curr.getDay();
        for (let i = 1; i < 7; i++) {

            const next = new Date(curr.getTime());
            next.setDate(first + i);
            let month = '' + (next.getMonth() + 1);
            let day = '' + next.getDate();
            const year = next.getFullYear();
            if (month.length < 2) { month = '0' + month; }
            if (day.length < 2) { day = '0' + day; }
            const ssdate = [year, month, day].join('-');
            weekdays = [...weekdays, ssdate];
        }
        this.lineChartLabels = weekdays;
        const current = (new Date()).getTime();
        let str = '';
        // str += 'sdate=' + current + '&edate=' + current;
        if (this.loggedUser.role === 'publisher') {
            str += '&pub_id=' + this.loggedUser.uid;
            str += '&status=show';
        }
        if (this.loggedUser.role === 'audit_profile') {
            str += '&call_type=inbound' + this.loggedUser.uid;
            str += '&pubArr=' + JSON.stringify(this.assignedPublisher);
        }

        /* weekly root */
        this.myservice.get('/cdr/weeklyReport?' + str)
            .subscribe(data => {
                this.lineChartData = data.weekly.data;
                this.lineChartLabels = data.weekly.week;
            });
    }
    public refreshHourly() {
        this.calls_chart_title = 'Hourly';
        /* CST timezone in the frontend */
        // const current = (new Date((new Date()).toLocaleString("en-US", { timeZone: 'America/Chicago' }))).getTime();
        let hours = [];

        for (let i = 0; i < 24; i++) {

            const next = this.calcTime(-5); // new Date();

            let month = '' + (next.getMonth() + 1);
            let day = '' + next.getDate();
            const year = next.getFullYear();
            if (month.length < 2) { month = '0' + month; }
            if (day.length < 2) { day = '0' + day; }
            let ssdate: any;
            if (i < 10) {
                ssdate = [year, month, day].join('-') + ' 0' + i + ':00:00';
            } else {
                ssdate = [year, month, day].join('-') + ' ' + i + ':00:00';
            }
            hours = [...hours, ssdate];
        }
        this.lineChartLabels = hours;

        let str = '';

        if (this.loggedUser.role === 'publisher') {
            str += '&pub_id=' + this.loggedUser.uid;
            str += '&status=show';
        }
        if (this.loggedUser.role === 'audit_profile') {
            str += '&call_type=inbound' + this.loggedUser.uid;
            str += '&pubArr=' + JSON.stringify(this.assignedPublisher);
        }

        /* hourly root */
        this.myservice.get('/cdr/hourlyReport?' + str)
            .subscribe(data => {
                this.lineChartData = data.weekly.data;
                this.lineChartLabels = data.weekly.week;
            });
    }

    public refreshTransaction() {
        /* CST timezone in the frontend */
        // const current = (new Date((new Date()).toLocaleString("en-US", { timeZone: 'America/Chicago' }))).getTime();
        const current = (new Date()).getTime();
        let str = '';
        str += 'sdate=' + current + '&edate=' + current;
        if (this.daterange !== undefined && this.daterange.start !== undefined && this.daterange.end !== undefined &&
            this.daterange.start !== null) {
            const sdate = new Date(this.daterange.start.format('YYYY-MM-DD')).getTime();
            const edate = new Date(this.daterange.end.format('YYYY-MM-DD')).getTime();
            str = 'sdate=' + sdate + '&edate=' + edate;
        }
        if (this.loggedUser.role === 'publisher') {
            str += '&pub_id=' + this.loggedUser.uid;
        }
        /* Admin Transaction */
        this.myservice.get('/wallet/getPaidTransaction?' + str)
            .subscribe(data => {
                this.dataSource = new MatTableDataSource<AdminTransaction>(data.transaction);
                this.dataSource.paginator = this.paginator;
                this.dataSource.sort = this.sort;

            });
    }
    public refreshPie() {
        let publisher = 0;
        let buyers = 0;
        let tfns = 10;
        if (this.loggedUser.role === 'publisher') {
            this.pieChartLabels = [
                'Buyers',
                'TFNs'
            ];
            this.pieChartData = [0, 0];
            this.myservice.get('/buyer/getDashboardBuyers?pub_id=' + this.loggedUser.uid).subscribe(res => {
                buyers = res.totalBuyers;
                this.pieChartData = [buyers, tfns];
            });
            this.myservice.get('/tfn/getDashboardTfns?pub_id=' + this.loggedUser.uid).subscribe(res => {
                tfns = res.totaltfns;
                this.pieChartData = [buyers, tfns];
            });
        } else {
            this.myservice.get('/publisher/getDashboardPublishers').subscribe(res => {
                publisher = res.totalPublishers;
                this.pieChartData = [publisher, buyers, tfns];
            });
            this.myservice.get('/buyer/getDashboardBuyers').subscribe(res => {
                buyers = res.totalBuyers;
                this.pieChartData = [publisher, buyers, tfns];
            });
            this.myservice.get('/tfn/getDashboardTfns').subscribe(res => {
                tfns = res.totaltfns;
                this.pieChartData = [publisher, buyers, tfns];
            });
        }
    }
    calcTime(offset) {

        // create Date object for current location
        const d = new Date();

        // convert to msec
        // add local time zone offset
        // get UTC time in msec
        const utc = d.getTime() + (d.getTimezoneOffset() * 60000);

        // create new Date object for different city
        // using supplied offset
        const nd = new Date(utc + (3600000 * offset));

        // return time as a string
        return nd;
    }
}

const ELEMENT_DATA: AdminTransaction[] = [];
