import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CampaignComponent } from './campaign.component';
import { AddComponent } from './components/add.component';
import { EditComponent } from './components/edit.component';


const routes: Routes = [
    {
        path: '',
        component: CampaignComponent,
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
export class CampaignRoutingModule {
}
