import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManagegroupRoutingModule } from './managegroup-routing.module';
import { ManagegroupComponent } from './managegroup.component';
import { MatButtonModule, MatCardModule, MatTableModule, MatSortModule, MatPaginatorModule, MatCheckboxModule, MatDatepickerModule, MatFormFieldModule, MatNativeDateModule, MatInputModule, MatChipsModule, MatIconModule,MatAutocompleteModule } from '@angular/material';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CommonService } from '../../shared/services/common.service';
import { PublisherService } from '../../shared/services/publisher.service';


import { AddComponent } from './group/add.component';
import { EditComponent } from './group/edit.component';




@NgModule({
  imports: [
    CommonModule, 
    ManagegroupRoutingModule,
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
    ManagegroupComponent,
    AddComponent,
    EditComponent
  ]
})
export class ManagegroupModule { }
