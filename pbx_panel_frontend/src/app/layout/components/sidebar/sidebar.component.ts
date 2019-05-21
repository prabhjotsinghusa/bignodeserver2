import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from '../../../shared/services/common.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
    isActive: boolean = false;
    collapsed: boolean = false;
    showMenu: string = '';
    pushRightClass: string = 'push-right';
    buyersArr = [453, 463];

    @Output() collapsedEvent = new EventEmitter<boolean>();
    user;
    formdata;
    loggedUserSettings;
    edit_buyer_id = 0;
    isLoading = true;
    buyer_numbers: any = [];
    buyer;
    loggedUser;
    selected_buyer_id = '';
    selected_pub_id = 0;
    enablecapping;
    realtime;

    constructor(
        private translate: TranslateService,
        public router: Router,
        private activeroute: ActivatedRoute,
        private myservice: CommonService) {
        this.translate.addLangs(['en', 'fr', 'ur', 'es', 'it', 'fa', 'de']);
        this.translate.setDefaultLang('en');
        const browserLang = this.translate.getBrowserLang();
        this.translate.use(browserLang.match(/en|fr|ur|es|it|fa|de/) ? browserLang : 'en');

        this.router.events.subscribe(val => {
            if (
                val instanceof NavigationEnd &&
                window.innerWidth <= 999 &&
                this.isToggled()
            ) {
                this.toggleSidebar();
            }
        });

        this.user = JSON.parse(localStorage.getItem('user'));
        this.loggedUserSettings = JSON.parse(localStorage.getItem('userSettings'));
    }


    ngOnInit() {
        if (this.user.role === 'buyer') {
            /* /BuyerNumbers/getBuyerNumber/344 */
            this.myservice.get('/BuyerNumbers/getBuyerNumber/' + this.user.buyer_id).subscribe(
                data => {
                    localStorage.setItem('buyerNumbers', JSON.stringify(data.buyerNumber));
                    this.buyer_numbers = data.buyerNumber;
                    this.buyer_numbers.forEach(element => {
                        if (element.capping) {
                            this.enablecapping = element.capping;
                        }
                        if (element.realtime) {
                            this.realtime = element.realtime;
                        }
                    });
                }, err => {
                    console.log(err);
                }
            );
        }
    }

    eventCalled() {
        this.isActive = !this.isActive;
    }

    addExpandClass(element: any) {
        if (element === this.showMenu) {
            this.showMenu = '0';
        } else {
            this.showMenu = element;
        }
    }

    toggleCollapsed() {
        this.collapsed = !this.collapsed;
        this.collapsedEvent.emit(this.collapsed);
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

    changeLang(language: string) {
        this.translate.use(language);
    }
    /* Logout from sidebar */
    onLoggedout() {
        localStorage.removeItem('isLoggedin');
        localStorage.removeItem('user');
        localStorage.removeItem('login_token');
        localStorage.removeItem('userSettings');
        localStorage.removeItem('buyerNumbers');
        this.router.navigate(['login']);
    }
}
