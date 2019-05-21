import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BuyernumbersRoutingModule } from './buyernumbers-routing.module';
import { BuyernumbersComponent } from './buyernumbers.component';
import { MatButtonModule, MatCardModule, MatTableModule, MatPaginatorModule, MatSortModule, MatCheckboxModule, MatDatepickerModule, MatFormFieldModule, MatNativeDateModule, MatInputModule, MatAutocompleteModule, MatSlideToggleModule } from '@angular/material';

import { MatExpansionModule } from '@angular/material/expansion';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgDateRangePickerModule } from 'ng-daterangepicker';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DataTablesModule } from 'angular-datatables';
import { FlashMessagesModule } from 'angular2-flash-messages';

import { CommonService } from '../../shared/services/common.service';
import { PublisherService } from '../../shared/services/publisher.service';

import { AddComponent } from './components/add.component';
import { EditComponent } from './components/edit.component';


@NgModule({
  imports: [
    CommonModule,
    BuyernumbersRoutingModule,
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
    MatExpansionModule,
    MatSlideToggleModule,
    FormsModule,
    DataTablesModule,
    FlashMessagesModule.forRoot(),
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
    MatExpansionModule,
    MatSlideToggleModule
  ],
  providers: [CommonService, PublisherService],
  declarations: [
    BuyernumbersComponent,
    AddComponent,
    EditComponent,
  ]
})
export class BuyernumbersModule { }
