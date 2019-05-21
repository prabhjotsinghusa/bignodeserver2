import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BuyermonitoringComponent } from './buyermonitoring.component';

const routes: Routes = [

  {
    path: '',
    component: BuyermonitoringComponent,
  },
  {
    path: ':queue/:qname',
    component: BuyermonitoringComponent,
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BuyermonitoringRoutingModule { }
