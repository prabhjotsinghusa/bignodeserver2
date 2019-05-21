import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ManagegroupComponent } from './managegroup.component';
import { AddComponent } from './group/add.component';
import { EditComponent } from './group/edit.component';


const routes: Routes = [
    {
        path: '', 
        component: ManagegroupComponent,       
    },
    {
        path: 'add',
        component: AddComponent,
    },
    {
        path: 'edit/:gid',
        component: EditComponent,
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ManagegroupRoutingModule {
}
