import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { OutboundcdrComponent } from './outboundcdr.component';

const routes: Routes = [

  {
    path: '',
    component: OutboundcdrComponent,
}


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OutboundcdrRoutingModule { }
