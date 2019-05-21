import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuditprofileRoutingModule } from './auditprofile-routing.module';
import { AuditprofileComponent } from './auditprofile.component';
import { MatButtonModule, MatCardModule, MatTableModule, MatSortModule, MatPaginatorModule, MatCheckboxModule, MatDatepickerModule, 
  MatFormFieldModule, MatNativeDateModule, MatInputModule, MatChipsModule, MatIconModule,MatAutocompleteModule } from '@angular/material';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CommonService } from '../../shared/services/common.service';
import { PublisherService } from '../../shared/services/publisher.service';


import { AddComponent } from './audit/add.component';
import { EditComponent } from './audit/edit.component';
import { AssignedComponent } from './audit/assigned.component';
import { DataTablesModule } from 'angular-datatables';
import { FlashMessagesModule } from 'angular2-flash-messages';




@NgModule({
  imports: [
    CommonModule, 
    AuditprofileRoutingModule,
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
    MatChipsModule,
    MatIconModule,
    MatAutocompleteModule,
    NgbModule.forRoot(),
    FormsModule,
    ReactiveFormsModule,
    DataTablesModule,
    FlashMessagesModule.forRoot()
  ],
  exports:[
    MatButtonModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule ,
    MatCheckboxModule,
    MatDatepickerModule,
    MatFormFieldModule                                                                                                                                                                                                                                                                                                                            

],
  providers: [CommonService,PublisherService],
  declarations: [
    AuditprofileComponent,
    AddComponent,
    EditComponent,
    AssignedComponent
  ]
})
export class AuditprofileModule { }
