import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { routerTransition } from '../../../router.animations';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./publisher.component.scss'],
    animations: [routerTransition()]
})
export class ProfileComponent implements OnInit {
    loggedUser;
    loggedUserSettings;
    constructor(public router: Router) {
        this.loggedUser = JSON.parse(localStorage.getItem('user'));
        this.loggedUserSettings = JSON.parse(localStorage.getItem('userSettings'));
    }

    ngOnInit() { }
}
