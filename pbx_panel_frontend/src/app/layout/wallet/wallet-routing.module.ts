import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WalletComponent } from './wallet.component';
import { AddpaymentComponent } from './wallet/addpayment.component';
import { PublisherBalanceComponent } from './wallet/publisherbalance.component';
import { BuyerBalanceComponent } from './wallet/buyerbalance.component';
import { AdddeductionComponent } from './wallet/adddeduction.component';
import { FinanceComponent } from './wallet/finance.component';

const routes: Routes = [
    {
        path: '',
        component: WalletComponent,
    },
    {
        path: 'finance',
        component: PublisherBalanceComponent,
    },
    {
        path: 'finance2',
        component: FinanceComponent,
    },
    {
        path: 'buyer_finance',
        component: BuyerBalanceComponent,
    },
    {
        path: 'payment',
        component: AddpaymentComponent,
    },
    {
        path: 'payment/:id',
        component: AddpaymentComponent,
    },
    {
        path: 'deduction',
        component: AdddeductionComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class WalletRoutingModule {
}
