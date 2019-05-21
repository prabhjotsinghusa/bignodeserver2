import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerreportRoutingModule } from './customerreport-routing.module';
import { CustomerreportComponent } from './customerreport.component';
import { MatButtonModule, MatCardModule, MatTableModule, MatPaginatorModule, MatSortModule, MatCheckboxModule, MatDatepickerModule, MatFormFieldModule, MatNativeDateModule, MatInputModule, MatAutocompleteModule } from '@angular/material';

import { DataTablesModule } from 'angular-datatables';
// import { MatFileUploadModule } from './angular-material-fileupload';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlashMessagesModule } from 'ngx-flash-messages';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { CommonService } from '../../shared/services/common.service';
import { PublisherService } from '../../shared/services/publisher.service';
import { ExcelService } from '../../shared/services/excel.service';
import { FileUtil } from './file.util';
import { Constants } from './test.constants';


// import { AddComponent } from './components/add.component';
// import { EditComponent } from './components/edit.component';



@NgModule({
  imports: [

    CommonModule,
    CustomerreportRoutingModule,
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
    ReactiveFormsModule,
    DataTablesModule,
//    MatFileUploadModule,
    FlashMessagesModule,
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
    DataTablesModule,
  ],
  providers: [
    CommonService,
    PublisherService,
    ExcelService,
    FileUtil,
    Constants
  ],
  declarations: [
    CustomerreportComponent
  ]
})
export class CustomerreportModule { }
