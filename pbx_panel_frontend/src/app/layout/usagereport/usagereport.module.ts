import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsagereportRoutingModule } from './usagereport-routing.module';
import { UsagereportComponent } from './usagereport.component';
import { MatButtonModule, MatCardModule, MatTableModule, MatPaginatorModule, MatSortModule, MatCheckboxModule, MatDatepickerModule,
   MatFormFieldModule, MatNativeDateModule, MatInputModule, MatAutocompleteModule, MatSpinner,
    MatProgressSpinnerModule } from '@angular/material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgDateRangePickerModule } from 'ng-daterangepicker';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DataTablesModule } from 'angular-datatables';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';

import { CommonService } from '../../shared/services/common.service';
import { ExcelService } from '../../shared/services/excel.service';
import { PublisherService } from '../../shared/services/publisher.service';

@NgModule({
  imports: [
    CommonModule,
    UsagereportRoutingModule,
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
    FormsModule,
    DataTablesModule,
    NgDateRangePickerModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
    NgbModule.forRoot(),
    NgxDaterangepickerMd
  ],

  exports: [
    MatButtonModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatProgressSpinnerModule
  ],
  providers: [CommonService, PublisherService,ExcelService],
  declarations: [UsagereportComponent]
})
export class UsagereportModule { }
