import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuditreportComponent } from './auditreport.component';

const routes: Routes = [
    {
        path: '',
        component: AuditreportComponent,
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AuditreportRoutingModule {
}
