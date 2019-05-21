import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { OxygencallsComponent } from './oxygencalls.component';

const routes: Routes = [
    {
        path: '',
        component: OxygencallsComponent,
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class OxygencallsRoutingModule {
}
