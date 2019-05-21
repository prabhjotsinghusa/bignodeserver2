import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EodComponent } from './eod.component';

const routes: Routes = [
    {
        path: '',
        component: EodComponent,
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class EodRoutingModule {
}
