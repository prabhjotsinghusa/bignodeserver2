import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BuyerreportComponent } from './buyerreport.component';


const routes: Routes = [
  {
    path: '',
    component: BuyerreportComponent,
  },
  {
    path: ':buyerNumber',
    component: BuyerreportComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BuyerreportRoutingModule { }
