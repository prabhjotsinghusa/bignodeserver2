import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WalletRoutingModule } from './wallet-routing.module';
import { WalletComponent } from './wallet.component';
import { MatButtonModule, MatCardModule, MatTableModule, MatPaginatorModule, MatSortModule, MatCheckboxModule, MatDatepickerModule, 
  MatFormFieldModule, MatNativeDateModule, MatInputModule, MatAutocompleteModule, MatSelect, MatSelectModule, 
  MatChipsModule, MatIconModule } from '@angular/material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';

import { CommonService } from '../../shared/services/common.service';
import { PublisherService } from '../../shared/services/publisher.service';
import { BuyerService } from '../../shared/services/buyer.service';
import { NgDateRangePickerModule } from 'ng-daterangepicker';
import { AddpaymentComponent } from './wallet/addpayment.component';
import { AdddeductionComponent } from './wallet/adddeduction.component';
import { PublisherBalanceComponent } from './wallet/publisherbalance.component';
import { BuyerBalanceComponent } from './wallet/buyerbalance.component';
import { FinanceComponent } from './wallet/finance.component';

@NgModule({
  imports: [
    CommonModule,
    WalletRoutingModule,
    MatButtonModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatNativeDateModule,
    MatInputModule,
    MatAutocompleteModule,
    NgDateRangePickerModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    MatChipsModule,
    MatIconModule,
    NgbModule.forRoot(),
    NgxDaterangepickerMd
  ],
  providers: [CommonService, PublisherService, BuyerService],
  declarations: [
    WalletComponent,
    AddpaymentComponent,
    PublisherBalanceComponent,
    BuyerBalanceComponent,
    AdddeductionComponent,
    FinanceComponent,
  ]
})
export class WalletModule { }
