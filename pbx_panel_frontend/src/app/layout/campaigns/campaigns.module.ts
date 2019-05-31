import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CampaignsRoutingModule } from './campaigns-routing.module';
import { CampaignsComponent } from './campaigns.component';
import { MatButtonModule, MatCardModule, MatTableModule, MatPaginatorModule, MatSortModule, MatCheckboxModule, MatDatepickerModule, MatFormFieldModule, MatNativeDateModule, 
MatInputModule, MatAutocompleteModule, MatStepperModule} from '@angular/material';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { CommonService } from '../../shared/services/common.service';
import { PublisherService } from '../../shared/services/publisher.service';

import { AddComponent } from './components/add.component';
import { EditComponent } from './components/edit.component';
import { AddtfnComponent } from './components/addtfn.component';



@NgModule({
  imports: [
    CommonModule,
    CampaignsRoutingModule,
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
    MatStepperModule,
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
  providers: [CommonService, PublisherService],
  declarations: [
    CampaignsComponent,
    AddComponent,
    AddtfnComponent,
    EditComponent,
  ]
})
export class CampaignsModule { }
