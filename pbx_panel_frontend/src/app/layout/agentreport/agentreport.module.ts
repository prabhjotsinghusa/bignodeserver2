import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgentReportRoutingModule } from './agentreport-routing.module';
import { AgentreportComponent } from './agentreport.component';
import { MatButtonModule, MatCardModule, MatTableModule, MatPaginatorModule, MatSortModule, MatCheckboxModule, MatDatepickerModule, MatFormFieldModule, MatNativeDateModule, MatInputModule, MatAutocompleteModule,MatProgressSpinnerModule } from '@angular/material';
import { NgDateRangePickerOptions } from 'ng-daterangepicker';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgDateRangePickerModule } from 'ng-daterangepicker';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DataTablesModule } from 'angular-datatables';
import {Ng2PaginationModule} from 'ng2-pagination';
import { CommonService } from '../../shared/services/common.service';
import { PublisherService } from '../../shared/services/publisher.service';
import { ExcelService } from '../../shared/services/excel.service';

@NgModule({
  imports: [
    CommonModule,
    AgentReportRoutingModule,
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
    Ng2PaginationModule,
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
    MatProgressSpinnerModule,
    Ng2PaginationModule
  ],
  providers: [CommonService, PublisherService,ExcelService],
  declarations: [
    AgentreportComponent
  ]
})
export class AgentreportModule{ }
