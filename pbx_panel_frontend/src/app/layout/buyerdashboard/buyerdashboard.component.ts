import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource, MatCheckboxModule, MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Router, NavigationEnd } from '@angular/router';
import { NgDateRangePickerOptions } from 'ng-daterangepicker';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs';
import { switchMap, debounceTime } from 'rxjs/operators';
import { DataTableDirective } from 'angular-datatables';

import { routerTransition } from '../../router.animations';

import { CommonService } from '../../shared/services/common.service';
import { PublisherService } from '../../shared/services/publisher.service';
import { CampService } from '../../shared/services/camp.service';

@Component({
    selector: 'app-buyerdashboard',
    templateUrl: './buyerdashboard.component.html',
    styleUrls: ['./buyerdashboard.component.scss'],
    animations: [routerTransition()]
})

export class BuyerdashboardComponent implements OnInit {
    dtOptions: any = {};
    dtTrigger = new Subject();
    options: NgDateRangePickerOptions;

    grid_deleted = false;

    @ViewChild(DataTableDirective)
    dtElement: DataTableDirective;

    formdata;
    error = false;
    error_message = `Some error occur.`;
    isLoading = true;

    totalcalls = 0;
    totalpayablecalls = 0;
    buyerdashboard;
    totalpayableamount = 0;
    loggedUser;
    loggedUserSettings;

    constructor(public dialog: MatDialog, public router: Router, private myservice: CommonService,
        private publisherservice: PublisherService, private campservice: CampService) {
        this.loggedUser = JSON.parse(localStorage.getItem('user'));
        this.loggedUserSettings = JSON.parse(localStorage.getItem('userSettings'));
    }

    ngOnInit() {
        const buyerArr = [443];/* array for buyer dashboard */
        if (buyerArr.indexOf(this.loggedUser.buyer_id) > -1) {
            this.router.navigate(['cdr']);
        } 
    
        this.dtOptions = {
            pagingType: 'full_numbers',
            pageLength: 20,
            order: [[0, 'asc']],
            dom: 'Bfrtip',
            buttons: [
                'copy',
                'print',
                'csv',
                'excel'
            ]
        };

        const current = (new Date()).getTime();

        let str = 'buyer_id=' + this.loggedUser.buyer_id;
        str += '&sdate=' + current + '&edate=' + current;
        this.getCDR(str);

        this.formdata = new FormGroup({
            selected_date: new FormControl(''),
        });
    }
    getCDR(str) {
        this.myservice.get('/cdr/buyerDashboard?' + str)
            .subscribe(data => {
                this.buyerdashboard = data.buyerDashboard;
                this.buyerdashboard.map(b => {
                    this.totalcalls += b.result.totalCalls;
                    this.totalpayablecalls += b.result.payableCalls;
                    if (b.result.payableAmount.length > 0) {
                        this.totalpayableamount += b.result.payableAmount[0].amount;
                    }
                });
                this.dtTrigger.next();
                this.isLoading = false;
            });
    }
    ngOnDestroy(): void {
        // Do not forget to unsubscribe the event
        this.dtTrigger.unsubscribe();
    }
    searchWithFilter() {
        this.isLoading = true;
        this.totalcalls = 0;
        this.totalpayablecalls = 0;
        this.totalpayableamount = 0;

        const data = this.formdata.value;

        let str = 'buyer_id=' + this.loggedUser.buyer_id;
        if (data.selected_date) {
            const selected_date = (new Date(data.selected_date.year, (data.selected_date.month - 1),
                (data.selected_date.day))).getTime();
            str += '&sdate=' + selected_date + '&edate=' + selected_date;
        }
        this.myservice.get('/cdr/buyerDashboard?' + str)
            .subscribe(data => {
                this.isLoading = false;
                this.buyerdashboard = data.buyerDashboard;
                this.buyerdashboard.map(b => {
                    this.totalcalls += b.result.totalCalls;
                    this.totalpayablecalls += b.result.payableCalls;
                    if (b.result.payableAmount.length > 0) {
                        this.totalpayableamount += b.result.payableAmount[0].amount;
                    }
                });
                this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
                    // Destroy the table first
                    dtInstance.destroy();
                    // Call the dtTrigger to rerender again
                    this.dtTrigger.next();
                });

            });
    }

}
