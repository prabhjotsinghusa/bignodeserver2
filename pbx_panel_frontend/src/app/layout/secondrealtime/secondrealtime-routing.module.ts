import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SecondrealtimeComponent} from './secondrealtime.component';
import { PublisherComponent } from './components/publisher.component';
import { BuyerComponent } from './components/buyer.component';
import { CommoncallsComponent } from './components/commoncalls.component';

const routes: Routes = [
    {
        path: '',
        component: SecondrealtimeComponent,
    },
    {
        path: 'publisher',
        component: PublisherComponent,
    },
    {
        path: 'buyer',
        component: BuyerComponent,
    },
    {
        path: 'commoncalls',
        component: CommoncallsComponent,
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class SecondrealtimeRoutingModule {
}
