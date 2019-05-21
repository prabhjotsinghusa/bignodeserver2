import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TfnsRoutingModule } from './tfns-routing.module';
import { TfnsComponent } from './tfns.component';
import {
  MatButtonModule, MatCardModule, MatTableModule, MatPaginatorModule, MatSortModule, MatCheckboxModule,
  MatDatepickerModule, MatFormFieldModule, MatNativeDateModule, MatInputModule, MatAutocompleteModule
} from '@angular/material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';

import { CommonService } from '../../shared/services/common.service';
import { PublisherService } from '../../shared/services/publisher.service';

import { AddComponent } from './tfns/add.component';
import { EditComponent } from './tfns/edit.component';
import { BuyComponent } from './tfns/buy.component';
import { AssignpublisherComponent } from './tfns/assignpublisher.component';
import { PendingtfnsComponent } from './tfns/pendingtfns.component';



@NgModule({
  imports: [
    CommonModule,
    TfnsRoutingModule,
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
    NgMultiSelectDropDownModule.forRoot()
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
    TfnsComponent,
    AddComponent,
    EditComponent,
    BuyComponent,
    AssignpublisherComponent,
    PendingtfnsComponent
  ]
})
export class TfnsModule { }
