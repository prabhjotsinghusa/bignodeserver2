import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { AudioComponent } from './audio.component';
import { AudioRoutingModule } from './audio-routing.module'
import { CommonService } from '../../shared/services/common.service';
import { PublisherService } from '../../shared/services/publisher.service';
import { ExcelService } from '../../shared/services/excel.service';
import { FlashMessagesModule } from 'ngx-flash-messages';
import { AddComponent } from './component/add.component';
import { DataTablesModule } from 'angular-datatables';
import { MatButtonModule, MatCardModule, MatTableModule, MatPaginatorModule, MatSortModule, MatCheckboxModule, 
  MatDatepickerModule, MatFormFieldModule, MatNativeDateModule, MatInputModule, MatAutocompleteModule } from '@angular/material';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgDateRangePickerModule } from 'ng-daterangepicker';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';





@NgModule({
  imports: [
    CommonModule,
    AudioRoutingModule,
    HttpClientModule,
    FlashMessagesModule,
    DataTablesModule,
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
  providers: [CommonService, PublisherService,ExcelService],
  declarations: [
    AudioComponent,
    AddComponent
  ]
})
export class AudioModule { }
