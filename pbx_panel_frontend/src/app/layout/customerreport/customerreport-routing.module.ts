import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CustomerreportComponent } from './customerreport.component';


const routes: Routes = [
    {
        path: '',
        component: CustomerreportComponent,
    },

];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CustomerreportRoutingModule {
}
