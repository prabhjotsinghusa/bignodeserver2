import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { routerTransition } from '../../../router.animations';
import { CommonService } from '../../../shared/services/common.service';

@Component({
    selector: 'app-add',
    templateUrl: './add.component.html',
    styleUrls: ['./common.component.scss'],
    animations: [routerTransition()]
})
export class AddComponent implements OnInit {
    constructor(public router: Router, private myservice: CommonService) { }
    formdata;
    error = false;
    show_error = false;
    error_message = ``;
    ngOnInit() {
        this.formdata = new FormGroup({
            queue: new FormControl('', Validators.required),
            buyer_number: new FormControl('', Validators.compose([
                Validators.required,
                Validators.minLength(3),
                Validators.maxLength(15),
            ])),
            capping: new FormControl('', Validators.compose([
                Validators.required,
                Validators.minLength(1),
                Validators.maxLength(15),
            ])),
            global_cap: new FormControl('', Validators.compose([
                Validators.required,
                Validators.maxLength(15),
            ])),
        });
    }
    save() {
        this.error = false;
        if (this.formdata.invalid) {
            this.error = true;
        } else {
            const data = this.formdata.value; 
           // console.log(data);
            /* $html = $this->hitcurl('https://portal.pbx4you.com/cc_caping/web_service/add_buyer.php?buyer='.$buyer_number.'&queue='.$queue.'&cc='.$cc_number); */
            this.myservice.post('/cappings/add', data)
                .subscribe(
                    result => {
                        if (result.capping) {
                            this.router.navigate(['/cccapping']);
                        }
                        if (result.success == 'NOK') {
                            this.error_message = result.message;
                            this.show_error = true;
                        }
                    },
                    err => {
                        console.log(err, 'error');
                    }
                );
        }
    }
}
