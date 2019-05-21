import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BlacklistComponent } from './blacklist.component';

const routes: Routes = [
    {
        path: '',
        component: BlacklistComponent,
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class BlacklistRoutingModule {
}
