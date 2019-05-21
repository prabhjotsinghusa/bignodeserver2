import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AudioComponent } from './audio.component'
import { AddComponent } from './component/add.component';
const routes: Routes = [

  {
    path: '',
    component: AudioComponent,
  },
  {
    path: 'add',
    component: AddComponent,
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AudioRoutingModule { }
