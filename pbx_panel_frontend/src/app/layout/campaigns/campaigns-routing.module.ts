import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CampaignsComponent } from './campaigns.component';
import { AddComponent } from './components/add.component';
import { EditComponent } from './components/edit.component';
import { AddtfnComponent } from './components/addtfn.component';


const routes: Routes = [
    {
        path: '',
        component: CampaignsComponent,
    },
    {
        path: 'add',
        component: AddComponent,
    },
    {
        path: 'addtfn/:id',
        component: AddtfnComponent,
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
export class CampaignsRoutingModule {
}
