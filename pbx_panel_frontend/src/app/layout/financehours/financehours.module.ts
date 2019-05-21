import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FinanceHoursRoutingModule } from './financehours-routing.module';
import { FinanceHoursComponent } from './financehours.component';
import { MatButtonModule, MatCardModule, MatTableModule, MatPaginatorModule, MatSortModule, MatCheckboxModule, MatDatepickerModule, MatFormFieldModule, MatNativeDateModule, MatInputModule, MatAutocompleteModule, MatSelect, MatSelectModule, MatChipsModule, MatIconModule } from '@angular/material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from '../../shared/services/common.service';
import { PublisherService } from '../../shared/services/publisher.service';
import { BuyerService } from '../../shared/services/buyer.service';
import { NgDateRangePickerModule } from 'ng-daterangepicker';
import { AddComponent } from './financehours/add.component';
import { EditComponent } from './financehours/edit.component';

@NgModule({
  imports: [
    CommonModule,
    FinanceHoursRoutingModule,
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
    NgDateRangePickerModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    MatChipsModule,
    MatIconModule,
    NgbModule.forRoot()
  ],
  providers: [CommonService, PublisherService, BuyerService],
  declarations: [
    FinanceHoursComponent,
    AddComponent,
    EditComponent,

  ]
})
export class FinanceHoursModule { }
