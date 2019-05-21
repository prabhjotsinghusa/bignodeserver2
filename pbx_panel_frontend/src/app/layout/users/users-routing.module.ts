import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UsersComponent } from './users.component';
import { AddComponent } from './publisher/add.component';
import { EditComponent } from './publisher/edit.component';
import { AddbuyerComponent } from './publisher/addbuyer.component';
import { ProfileComponent } from './publisher/profile.component';
import { ProfileeditComponent } from './publisher/profileedit.component';
import { PasswordeditComponent } from './publisher/passwordedit.component';

const routes: Routes = [
    {
        path: '',
        component: UsersComponent,
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
        path: 'addbuyer/:uid',
        component: AddbuyerComponent,
    },
    {
        path: 'profile',
        component: ProfileComponent,
    },
    {
        path: 'profileedit',
        component: ProfileeditComponent,
    },
    {
        path: 'passwordedit',
        component: PasswordeditComponent,
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class UsersRoutingModule {
}
