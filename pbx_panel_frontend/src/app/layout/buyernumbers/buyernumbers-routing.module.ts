import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BuyernumbersComponent } from './buyernumbers.component';
import { AddComponent } from './components/add.component';
import { EditComponent } from './components/edit.component';


const routes: Routes = [
    {
        path: '',
        component: BuyernumbersComponent,
    },
    {
        path: 'add',
        component: AddComponent,
    },
    {
        path: 'edit/:id',
        component: EditComponent,
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class BuyernumbersRoutingModule {
}
