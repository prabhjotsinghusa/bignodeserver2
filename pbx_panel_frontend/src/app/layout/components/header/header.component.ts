import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { CommonService } from '../../../shared/services/common.service';
import { RealtimeService } from '../../../shared/services/realtime.service';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
    pushRightClass: string = 'push-right';
    pending_tfns = 0;
    notification;
    realtimecount = 0;
    loggedUser: any;
    loggedUserSettings: any;
    intervalVar: any;
    show_live = true;
    liveRoles = ['buyer', 'audit_profile'];
    constructor(private translate: TranslateService, public router: Router, private myservice: CommonService,
        private realTimeService: RealtimeService) {

        this.translate.addLangs(['en', 'fr', 'ur', 'es', 'it', 'fa', 'de', 'zh-CHS']);
        this.translate.setDefaultLang('en');
        const browserLang = this.translate.getBrowserLang();
        this.translate.use(browserLang.match(/en|fr|ur|es|it|fa|de|zh-CHS/) ? browserLang : 'en');

        this.router.events.subscribe(val => {
            if (
                val instanceof NavigationEnd &&
                window.innerWidth <= 992 &&
                this.isToggled()
            ) {
                this.toggleSidebar();
            }
        });
        this.user = this.loggedUser = JSON.parse(localStorage.getItem('user'));
        this.loggedUserSettings = JSON.parse(localStorage.getItem('userSettings'));
    }
    user;
    ngOnInit() {

        if (this.user.role === 'admin') {
            this.myservice.get('/getPendingTfns/')
                .subscribe(data2 => {
                    this.pending_tfns = data2.tfn;
                });
            this.myservice.get('/payment_notification/getAll/?status=1&limit=10')
                .subscribe(data2 => {
                    this.notification = data2.paymentnotification;
                });
        }
        if (this.liveRoles.indexOf(this.loggedUser.role) > -1) {
            this.show_live = false;
        }
        const that = this;
        if (this.show_live) {
            this.intervalVar = setInterval(() => {
                that.realtimeCount();
            }, 5000);
        }
    }
    ngOnDestroy() {
        // console.log('while leaving the destroy');
        clearInterval(this.intervalVar);
    }

    isToggled(): boolean {
        const dom: Element = document.querySelector('body');
        return dom.classList.contains(this.pushRightClass);
    }

    toggleSidebar() {
        const dom: any = document.querySelector('body');
        dom.classList.toggle(this.pushRightClass);
    }

    rltAndLtr() {
        const dom: any = document.querySelector('body');
        dom.classList.toggle('rtl');
    }

    onLoggedout() {
        localStorage.removeItem('isLoggedin');
        localStorage.removeItem('user');
        localStorage.removeItem('login_token');
        localStorage.removeItem('userSettings');
        localStorage.removeItem('buyerNumbers');
        this.router.navigate(['login']);
    }

    changeLang(language: string) {
        this.translate.use(language);
    }
    public realtimeCount() {
        const str = 'https://portal.pbx4you.com/realtime.php?hasher=U3VjY2Vzcw';

        this.realTimeService.get(str)
            .subscribe(data => {
                let d = data;
                d = data.filter(v => {
                    if (v.from_did !== ' \r') {
                        return v;
                    }
                });
                if (this.loggedUser.role === 'publisher') {
                    d = this.publisher(data);
                }
                this.realtimecount = d.length;
            });
    }
    publisher(data) {
        return data.filter(value => {
            if (value.status === 'show' && parseInt(value.queue) === this.loggedUser.uid) {
                return true;
            }
        });
    }

}
