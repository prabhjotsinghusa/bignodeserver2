import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserhistoryRoutingModule } from './userhistory-routing.module';

import { MatButtonModule, MatCardModule, MatTableModule, MatPaginatorModule, MatSortModule, MatCheckboxModule, MatDatepickerModule, 
  MatFormFieldModule, MatNativeDateModule, MatInputModule, MatAutocompleteModule } from '@angular/material';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgDateRangePickerModule } from 'ng-daterangepicker';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DataTablesModule } from 'angular-datatables';

import { CommonService } from '../../shared/services/common.service';
import { UserhistoryComponent } from './userhistory.component';

@NgModule({
  imports: [
    CommonModule,
    UserhistoryRoutingModule,
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
    NgDateRangePickerModule,
    ReactiveFormsModule,
    DataTablesModule,
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
  providers: [CommonService],
  declarations: [UserhistoryComponent
  ]
})
export class UserhistoryModule { }
