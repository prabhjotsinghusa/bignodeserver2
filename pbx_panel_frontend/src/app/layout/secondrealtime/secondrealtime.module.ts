import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SecondrealtimeRoutingModule } from './secondrealtime-routing.module';
import { SecondrealtimeComponent } from './secondrealtime.component';
import { MatButtonModule, MatCardModule, MatTableModule, MatPaginatorModule, MatSortModule, MatCheckboxModule, MatDatepickerModule, MatFormFieldModule, MatNativeDateModule, MatInputModule, MatAutocompleteModule } from '@angular/material';
import { MatExpansionModule } from '@angular/material/expansion';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgDateRangePickerModule } from 'ng-daterangepicker';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DataTablesModule } from 'angular-datatables';

import { CommonService } from '../../shared/services/common.service';
import { RealtimeService } from '../../shared/services/realtime.service';
import { PublisherService } from '../../shared/services/publisher.service';
import { PublisherComponent } from './components/publisher.component';
import { BuyerComponent } from './components/buyer.component';
import { CommoncallsComponent } from './components/commoncalls.component';

@NgModule({

  imports: [
    CommonModule,
    SecondrealtimeRoutingModule,
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
    FormsModule,
    DataTablesModule,
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
    MatExpansionModule


  ],
  providers: [CommonService, PublisherService, RealtimeService],
  declarations: [
    SecondrealtimeComponent,
    PublisherComponent,
    BuyerComponent,
    CommoncallsComponent
  ]
})
export class SecondrealtimeModule { }
