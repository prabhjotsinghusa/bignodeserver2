import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ShownotificationComponent } from './shownotification.component';

const routes: Routes = [
    {
        path: '',
        component: ShownotificationComponent,
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ShownotificationRoutingModule {
}
