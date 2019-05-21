import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CommonService } from '../shared/services/common.service';

import { LoginRoutingModule } from './login-routing.module';
import { LoginComponent } from './login.component';

@NgModule({
    imports: [
        CommonModule, 
        LoginRoutingModule,
        FormsModule,
        ReactiveFormsModule,

    ],
    providers: [CommonService],
    declarations: [LoginComponent]
})
export class LoginModule {}
