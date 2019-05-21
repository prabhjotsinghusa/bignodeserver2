import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource, MatCheckboxModule, MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Router, NavigationEnd } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NgDateRangePickerOptions } from 'ng-daterangepicker';
import { routerTransition } from '../../../router.animations';
import { Publisherbalance } from "../../../shared/models/publisherbalance";
import { Buyerbalance } from "../../../shared/models/buyerbalance";
import { Observable } from 'rxjs';
import { switchMap, debounceTime } from 'rxjs/operators';
import { CommonService } from '../../../shared/services/common.service';
import { PublisherService } from '../../../shared/services/publisher.service';
import { BuyerService } from '../../../shared/services/buyer.service';

@Component({
    selector: 'app-buyerbalance',
    templateUrl: './buyerbalance.component.html',
    styleUrls: ['./buyerbalance.component.scss'],
    animations: [routerTransition()]
})


export class BuyerBalanceComponent implements OnInit {

    options: NgDateRangePickerOptions;
    displayedColumns: string[] = ['buyerName','buyer_id', 'total_calls', 'qualified_calls', 'price_per_call', 'total_amount'];

    // campaignName: { $arrayElemAt: ["$campaigndata.camp_name", 0] },
    //publisherName: { $arrayElemAt: ["$userdata.fullname", 0] }
    dataSource = new MatTableDataSource<Buyerbalance>(ELEMENT_DATA);
    grid_deleted = false;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    activehours: Buyerbalance[];
    formdata;
    isLoading = false;
    isLoading2 = true;
    selected_buyer_id = 0;
    filteredBuyers: Observable<any>;
    loggedUser: any;
    loggedUserSettings: any;
    constructor(
        public dialog: MatDialog,
        public router: Router,
        private myservice: CommonService,
        private buyerservice: BuyerService,
        private publisherservice: PublisherService) {
        this.loggedUser = JSON.parse(localStorage.getItem('user'));
        this.loggedUserSettings = JSON.parse(localStorage.getItem('userSettings'));
    }

    ngOnInit() {
        this.dataSource.paginator = this.paginator;
        if(this.loggedUser.role === 'publisher'){
            this.myservice.get('/BuyerBalance?pub_id=850')
            .subscribe(data => {
                this.dataSource = new MatTableDataSource<Buyerbalance>(data.buyerFinance);
                this.callafterload();
            });
        } else {
            this.myservice.get('/BuyerBalance')
            .subscribe(data => {
                this.dataSource = new MatTableDataSource<Buyerbalance>(data.buyerFinance);
                this.callafterload();
            });
        }   

        this.formdata = new FormGroup({
            buyer_id: new FormControl(''),
            daterange: new FormControl('')
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
        if (this.loggedUser.role === 'publisher') {
            this.filteredBuyers = this.formdata.get('buyer_id').valueChanges.pipe(
                debounceTime(200),
                switchMap((value) => this.buyerservice.search(value, this.loggedUser.uid))
            );
        } else {
            this.filteredBuyers = this.formdata.get('buyer_id').valueChanges.pipe(
                debounceTime(200),
                switchMap((value) => this.buyerservice.search(value))
            );
        }
    }
    hideLoader() {
        this.isLoading = false;
        const p = this.formdata.get('buyer_id').value;
        this.selected_buyer_id = p.uid;
    }
    showLoader() {
        this.isLoading = true;
    }

    displayFn(buyer) {
        if (buyer) { return buyer.name; }
    }
    callafterload() {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.isLoading2 = false;
    }

    applyFilter(filterValue: string) {

        filterValue = filterValue.trim(); // Remove whitespace
        filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
        this.dataSource.filter = filterValue;
    }

    searchWithFilter() {
        this.isLoading2 = true;
        const data = this.formdata.value;

        if (data.daterange === '') {
            data.sdate = '';
            data.edate = '';
        } else {
            const dateArr = data.daterange.split('-');
            data.sdate = new Date(dateArr[0]).getTime();
            data.edate = new Date(dateArr[1]).getTime();
        }

        let str = '/BuyerBalance?';
        if (data.sdate === '') {
            str += 'sdate=&edate=';
        } else {
            str += 'sdate=' + data.sdate + '&edate=' + data.edate;
        }
        if (data.buyer_id.buyer_id > 0) {
            str += '&buyer_id=' + data.buyer_id.buyer_id;
        }
        if (this.loggedUser.role === 'publisher') {
            str += '&pub_id=' + this.loggedUser.uid;
        }
        this.myservice.get(str)
            .subscribe(result => {
                this.dataSource = new MatTableDataSource<Buyerbalance>(result.buyerFinance);
                this.callafterload();
            });
    }

}

const ELEMENT_DATA: Buyerbalance[] = [];

