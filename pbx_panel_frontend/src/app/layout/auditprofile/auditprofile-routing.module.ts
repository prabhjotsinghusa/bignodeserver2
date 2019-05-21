import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuditprofileComponent } from './auditprofile.component';
import { AddComponent } from './audit/add.component';
import { EditComponent } from './audit/edit.component';
import { AssignedComponent } from './audit/assigned.component';

const routes: Routes = [
    {
        path: '', 
        component: AuditprofileComponent,       
    },
    {
        path: 'add',
        component: AddComponent,
    },
    {
        path: 'edit/:uid',
        component: EditComponent,
    },
    {
        path: 'assigned/:uid',
        component: AssignedComponent,
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AuditprofileRoutingModule {
}
