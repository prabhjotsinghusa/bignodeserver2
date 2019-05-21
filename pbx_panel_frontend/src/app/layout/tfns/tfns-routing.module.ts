import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TfnsComponent } from './tfns.component';
import { AddComponent } from './tfns/add.component';
import { EditComponent } from './tfns/edit.component';
import { AssignpublisherComponent } from './tfns/assignpublisher.component';
import { PendingtfnsComponent } from './tfns/pendingtfns.component';
import { BuyComponent } from './tfns/buy.component';

const routes: Routes = [
    {
        path: '',
        component: TfnsComponent,
    },
    {
        path: 'add',
        component: AddComponent,
    },
    {
        path: 'edit/:tfn_id',
        component: EditComponent,
    },
    {
        path: 'assignpublisher',
        component: AssignpublisherComponent,
    },
    {
        path: 'pending',
        component: PendingtfnsComponent,
    },
    {
        path: 'buy',
        component: BuyComponent,
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class TfnsRoutingModule {
}
