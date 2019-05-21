import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BuyereodComponent } from './buyereod.component';

const routes: Routes = [
    {
        path: '',
        component: BuyereodComponent,
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class BuyereodRoutingModule {
}
