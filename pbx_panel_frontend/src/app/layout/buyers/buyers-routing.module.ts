import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BuyersComponent } from './buyers.component';
import { AddComponent } from './buyers/add.component';
import { EditComponent } from './buyers/edit.component';
import { BuyernumberComponent } from './buyers/buyernumber.component';

const routes: Routes = [
    {
        path: '',
        component: BuyersComponent,
    },
    {
        path: 'add',
        component: AddComponent,
    },
    {
        path: 'edit/:buyer_id',
        component: EditComponent,
    },
    {
        path: 'buyernumber/:buyer_id',
        component: BuyernumberComponent,
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class BuyersRoutingModule {
}
