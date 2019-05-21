import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FinanceHoursComponent } from './financehours.component';
import { AddComponent } from './financehours/add.component';
import { EditComponent } from './financehours/edit.component';

const routes: Routes = [
    {
        path: '',
        component: FinanceHoursComponent
    },
    {
        path: 'add',
        component: AddComponent
    },
    {
        path: 'edit/:id',
        component: EditComponent
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class FinanceHoursRoutingModule {
}
