import { Component, OnInit } from '@angular/core';
import { Router, RoutesRecognized, NavigationEnd } from '@angular/router';
import 'rxjs/add/operator/pairwise';
import 'rxjs/add/operator/filter';
import { CommonService } from '../shared/services';

@Component({
    selector: 'app-layout',
    templateUrl: './layout.component.html',
    styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {

    collapedSideBar: boolean;
    loggedUser: any;
    loggedUserSettings: any;

    constructor(public router: Router, private myservice:CommonService) {

        const AccessControl = {
            director: ['dashboard', 'charts', 'users', 'auditprofile', 'activehours', 'tfns', 'buyers', 'campaign',  'campaigns', 'cdr', 'eod',
                'agenteod', 'agentreport', 'tables', 'forms', 'bs-element', 'grid', 'components', 'managegroup', 'paymentnotification',
                'wallet', 'realtime', 'cccapping', 'financehours', 'oxygencalls', 'customerreport', 'usagereport', 'buyerreport',
                'buyerdashboard', 'login', 'error', 'access-denied', 'not-found', 'secondrealtime', 'buyereod', 'userhistory'],

            admin: ['dashboard', 'charts', 'users', 'auditprofile', 'activehours', 'tfns', 'buyers', 'campaign',  'campaigns', 'cdr', 'eod',
                'agenteod', 'agentreport', 'tables', 'forms', 'bs-element', 'grid', 'components', 'managegroup', 'paymentnotification',
                'wallet', 'realtime', 'cccapping', 'financehours', 'oxygencalls', 'customerreport', 'usagereport', 'buyerreport',
                'buyerdashboard', 'login', 'error', 'access-denied', 'not-found', 'secondrealtime', 'buyereod', 'buyernumbers', 'audio',
                'blacklist', 'userhistory'],

            audit_profile: ['dashboard', 'auditreport', 'login', 'error', 'access-denied', 'not-found'],

            publisher: ['dashboard', 'buyers', 'tfns', 'campaign',  'campaigns',  'cdr', 'realtime', 'wallet', 'login', 'error', 'access-denied',
                'not-found', 'users', 'secondrealtime', 'usagereport'],

            buyer: ['buyerdashboard', 'cdr', 'realtime', 'wallet', 'buyerreport', 'login', 'error', 'access-denied', 'not-found',
                'users', 'secondrealtime', 'outboundcdr', 'buyercapping', 'buyermonitoring', 'audio'],
        };


        this.loggedUser = JSON.parse(localStorage.getItem('user'));
        this.loggedUserSettings = JSON.parse(localStorage.getItem('userSettings'));

        const currentUrl = this.router.url;
        const routess = currentUrl.split('/');

        if (AccessControl[this.loggedUser.role].indexOf(routess[1]) === -1) {
            this.router.navigate(['/access-denied']);
        } else {
            if (this.loggedUser.role === 'publisher') {
                if (routess[1] === 'tfns') {
                    if (routess[2] !== undefined && routess[2] !== 'buy') {
                        this.router.navigate(['/access-denied']);
                    }
                }
                if (routess[1] === 'wallet') {
                    if (routess[2] !== undefined && (routess[2] === 'finance' || routess[2] === 'finance2'
                        || routess[2] === 'buyer_finance')) {

                    } else {
                        this.router.navigate(['/access-denied']);
                    }
                }
                if (routess[1] === 'users') {
                    if (routess[2] !== undefined && (routess[2] === 'profile' || routess[2] === 'passwordedit')) {

                    } else {
                        this.router.navigate(['/access-denied']);
                    }
                }
            }
            if (this.loggedUser.role === 'buyer') {
                if (routess[1] === 'wallet') {
                    if (routess[2] !== undefined && (routess[2] === 'walletbuyer')) {

                    } else {
                        this.router.navigate(['/access-denied']);
                    }
                }
                if (routess[1] === 'buyers') {
                    if (routess[2] !== undefined && (routess[2] !== 'buyernumber')) {
                        this.router.navigate(['/access-denied']);
                    }
                }
                if (routess[1] === 'users') {
                    if (routess[2] !== undefined && (routess[2] === 'profile' || routess[2] === 'passwordedit')) {

                    } else {
                        this.router.navigate(['/access-denied']);
                    }
                }
            }

        }
        // console.log(currentUrl, routess[1]);
        this.router.events
            .filter((e: any) => e instanceof NavigationEnd)
            .pairwise()
            .subscribe((e) => {
                // console.log(e, this.loggedUser);
                const currentRoute = e[1].urlAfterRedirects;
                if (currentRoute !== undefined && this.loggedUser.role !== 'admin') {
                    const data = { user: this.loggedUser, url: currentRoute };
                    if (this.loggedUser.role === 'buyer') {
                        data.user.fullname = data.user.name;
                    }
                    this.myservice.post('/userhistory/add', data).subscribe(res => {
                        // console.log(res, 'history data');
                    });
                }
            });
    }

    ngOnInit() { }

    receiveCollapsed($event) {
        this.collapedSideBar = $event;
    }
}
