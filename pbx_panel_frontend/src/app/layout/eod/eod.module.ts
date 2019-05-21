import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EodRoutingModule } from './eod-routing.module';
import { EodComponent } from './eod.component';
import { MatButtonModule, MatCardModule, MatTableModule, MatPaginatorModule, MatSortModule, MatCheckboxModule, MatDatepickerModule, MatFormFieldModule, MatNativeDateModule, MatInputModule, MatAutocompleteModule } from '@angular/material';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgDateRangePickerModule } from 'ng-daterangepicker';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DataTablesModule } from 'angular-datatables';

import { CommonService } from '../../shared/services/common.service';

import { ExcelService } from '../../shared/services/excel.service';
import { PublisherService } from '../../shared/services/publisher.service';


@NgModule({
  imports: [
    CommonModule,
    EodRoutingModule,
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
    NgbModule.forRoot(),
  ],
  exports: [
    MatButtonModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatFormFieldModule,
  ],
  providers: [CommonService, PublisherService,ExcelService],
  declarations: [
    EodComponent
  ]
})
export class EodModule { }
