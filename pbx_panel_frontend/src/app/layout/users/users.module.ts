import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersRoutingModule } from './users-routing.module';
import { UsersComponent } from './users.component';
import { MatButtonModule, MatCardModule, MatTableModule, MatSortModule, MatPaginatorModule, MatCheckboxModule, MatDatepickerModule,
   MatFormFieldModule, MatNativeDateModule, MatInputModule } from '@angular/material';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CommonService } from '../../shared/services/common.service';


import { AddComponent } from './publisher/add.component';
import { EditComponent } from './publisher/edit.component';
import { AddbuyerComponent } from './publisher/addbuyer.component';
import { ProfileComponent } from './publisher/profile.component';
import { ProfileeditComponent } from './publisher/profileedit.component';
import { PasswordeditComponent } from './publisher/passwordedit.component';
import { FlashMessagesModule } from 'angular2-flash-messages';
import { DataTablesModule } from 'angular-datatables';

@NgModule({
  imports: [
    CommonModule,
    UsersRoutingModule,
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
    NgbModule.forRoot(),
    FormsModule,
    ReactiveFormsModule,
    FlashMessagesModule.forRoot(),
    DataTablesModule

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
  providers: [CommonService],
  declarations: [
    UsersComponent,
    AddComponent,
    EditComponent,
    AddbuyerComponent,
    ProfileComponent,
    ProfileeditComponent,
    PasswordeditComponent
  ]
})
export class UsersModule { }
