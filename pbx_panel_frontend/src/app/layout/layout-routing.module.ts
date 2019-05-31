import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LayoutComponent } from './layout.component';

const routes: Routes = [
    {
        path: '',
        component: LayoutComponent,
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'prefix' },
            { path: 'dashboard', loadChildren: './dashboard/dashboard.module#DashboardModule' },
            { path: 'charts', loadChildren: './charts/charts.module#ChartsModule' },
            { path: 'users', loadChildren: './users/users.module#UsersModule' },
            { path: 'auditprofile', loadChildren: './auditprofile/auditprofile.module#AuditprofileModule' },
            { path: 'auditreport', loadChildren: './auditreport/auditreport.module#AuditreportModule' },
            { path: 'activehours', loadChildren: './activehours/activehours.module#ActivehoursModule' },
            { path: 'tfns', loadChildren: './tfns/tfns.module#TfnsModule' },
            { path: 'buyers', loadChildren: './buyers/buyers.module#BuyersModule' },
            { path: 'campaign', loadChildren: './campaign/campaign.module#CampaignModule' },
            { path: 'campaigns', loadChildren: './campaigns/campaigns.module#CampaignsModule' },
            { path: 'cdr', loadChildren: './cdr/cdr.module#CdrModule' },

            { path: 'outboundcdr', loadChildren: './outboundcdr/outboundcdr.module#OutboundcdrModule' },
            { path: 'eod', loadChildren: './eod/eod.module#EodModule' },
            { path: 'agenteod', loadChildren: './agenteod/agenteod.module#AgentModule' },
            // { path: 'manage', loadChildren: './user-management/user-management.module#UserManagementModule' },
            { path: 'tables', loadChildren: './tables/tables.module#TablesModule' },
            { path: 'forms', loadChildren: './form/form.module#FormModule' },
            { path: 'bs-element', loadChildren: './bs-element/bs-element.module#BsElementModule' },
            { path: 'grid', loadChildren: './grid/grid.module#GridModule' },
            { path: 'components', loadChildren: './bs-component/bs-component.module#BsComponentModule' },
            { path: 'managegroup', loadChildren: './managegroup/managegroup.module#ManagegroupModule' },
            { path: 'paymentnotification', loadChildren: './shownotification/shownotification.module#ShownotificationModule' },
            { path: 'wallet', loadChildren: './wallet/wallet.module#WalletModule' },
            //  { path: 'realtime', loadChildren: './realtime/realtime.module#RealtimeModule' },
            { path: 'secondrealtime', loadChildren: './secondrealtime/secondrealtime.module#SecondrealtimeModule' },
            { path: 'cccapping', loadChildren: './cccapping/cccapping.module#CccappingModule' },
            { path: 'buyercapping', loadChildren: './buyercapping/buyercapping.module#BuyercappingModule' },
            { path: 'financehours', loadChildren: './financehours/financehours.module#FinanceHoursModule' },
            { path: 'oxygencalls', loadChildren: './oxygencalls/oxygencalls.module#OxygencallsModule' },
            { path: 'customerreport', loadChildren: './customerreport/customerreport.module#CustomerreportModule' },
            { path: 'usagereport', loadChildren: './usagereport/usagereport.module#UsagereportModule' },
            { path: 'agentreport', loadChildren: './agentreport/agentreport.module#AgentreportModule' },
            { path: 'buyerreport', loadChildren: './buyerreport/buyerreport.module#BuyerreportModule' },
            { path: 'buyerdashboard', loadChildren: './buyerdashboard/buyerdashboard.module#BuyerdashboardModule' },
            { path: 'buyermonitoring', loadChildren: './buyermonitoring/buyermonitoring.module#BuyermonitoringModule' },
            { path: 'buyernumbers', loadChildren: './buyernumbers/buyernumbers.module#BuyernumbersModule' },
            { path: 'buyereod', loadChildren: './buyereod/buyereod.module#BuyereodModule'},
            { path: 'audio', loadChildren: './audio/audio.module#AudioModule' },
            { path: 'blacklist', loadChildren: './blacklist/blacklist.module#BlacklistModule' }


        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class LayoutRoutingModule { }
