import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BuyerdashboardComponent } from './buyerdashboard.component';

const routes: Routes = [
    {
        path: '',
        component: BuyerdashboardComponent,
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class BuyerdashboardRoutingModule {
}
