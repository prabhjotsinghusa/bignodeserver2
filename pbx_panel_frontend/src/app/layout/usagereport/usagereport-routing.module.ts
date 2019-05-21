import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { UsagereportComponent } from './usagereport.component';

const routes: Routes = [
  {
      path: '', component: UsagereportComponent
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  declarations: []
})
export class UsagereportRoutingModule { }
