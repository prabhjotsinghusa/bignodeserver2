import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserhistoryComponent } from './userhistory.component';

const routes: Routes = [
    {
        path: '',
        component: UserhistoryComponent,
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class UserhistoryRoutingModule {
}
