import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BuyersRoutingModule } from './buyers-routing.module';
import { BuyersComponent } from './buyers.component';
import { MatButtonModule, MatCardModule, MatTableModule, MatPaginatorModule, MatSortModule, MatCheckboxModule, MatDatepickerModule, MatFormFieldModule, 
  MatNativeDateModule, MatInputModule, MatAutocompleteModule } from '@angular/material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlashMessagesModule } from 'angular2-flash-messages';
import { DataTablesModule } from 'angular-datatables';

import { CommonService } from '../../shared/services/common.service';
import { PublisherService } from '../../shared/services/publisher.service';

import { AddComponent } from './buyers/add.component';
import { EditComponent } from './buyers/edit.component';
import { BuyernumberComponent } from './buyers/buyernumber.component';


@NgModule({
  imports: [
    CommonModule,
    BuyersRoutingModule,
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
    FlashMessagesModule.forRoot()
  ],
  exports: [
    MatButtonModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatFormFieldModule

  ],
  providers: [CommonService, PublisherService],
  declarations: [
    BuyersComponent,
    AddComponent,
    EditComponent,
    BuyernumberComponent,
  ]
})
export class BuyersModule { }
