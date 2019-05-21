import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShownotificationRoutingModule } from './shownotification-routing.module';
import { ShownotificationComponent } from './shownotification.component';
import { MatButtonModule, MatCardModule, MatTableModule, MatPaginatorModule, MatSortModule, MatCheckboxModule, MatDatepickerModule, MatFormFieldModule, MatNativeDateModule, MatInputModule, MatAutocompleteModule } from '@angular/material';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { CommonService } from '../../shared/services/common.service';

@NgModule({
  imports: [
    CommonModule,
    ShownotificationRoutingModule,
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
  declarations: [
    ShownotificationComponent,
  ]
})
export class ShownotificationModule { }
