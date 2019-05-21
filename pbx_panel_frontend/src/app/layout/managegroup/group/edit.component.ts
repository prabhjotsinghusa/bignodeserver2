import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatAutocompleteSelectedEvent, MatChipInputEvent } from '@angular/material';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { COMMA, ENTER } from '@angular/cdk/keycodes';

import { routerTransition } from '../../../router.animations';
import { CommonService } from '../../../shared/services/common.service';
import { PublisherService } from '../../../shared/services/publisher.service';

@Component({
    selector: 'app-edit',
    templateUrl: './edit.component.html',
    styleUrls: ['./group.component.scss'],
    animations: [routerTransition()]
})
export class EditComponent implements OnInit {
    constructor(public router: Router, private activeroute: ActivatedRoute,
        private myservice: CommonService, private publisherservice: PublisherService) {
        this.publisherservice.search('').subscribe(data => this.allPublishers = data.user);
        this.filteredpublishers = this.publishersCtrl.valueChanges.pipe(
            startWith(null),
            map((pub: string | null) => pub ? this._filter(pub) : this.allPublishers.slice()));
    }
    formdata;
    formdata2;
    isLoading = true;
    error = false;
    pub_error = false;
    success_msg: boolean = false;
    edit_user_id = 0;
    separatorKeysCodes: number[] = [ENTER, COMMA];
    filteredpublishers: Observable<any>;
    publishers: any[] = [];
    allPublishers: any[] = [];
    visible = true;
    selectable = true;
    removable = true;
    addOnBlur = false;
    publishersCtrl = new FormControl('');
    @ViewChild('pubInput') pubInput: ElementRef<HTMLInputElement>;
    ngOnInit() {
        this.formdata = new FormGroup({
            name: new FormControl('', Validators.compose([
                Validators.required,
                Validators.minLength(1),
            ])),
            publishers: new FormControl(''),
        });
        /* get url variables */
        this.activeroute.params.subscribe(params => {
            this.edit_user_id = params.gid;
        });
        this.myservice.get('/group/getAll/' + this.edit_user_id).subscribe(data => {
            console.log(data);
            this.publishers = data = data.groups[0].publishers.map(data => {

                return { uid: data.uid, fullname: data.fullname };
            });
            this.isLoading = false;
            //console.log(data);
        });

        this.myservice.get('/group/getAll/' + this.edit_user_id).subscribe(
            data => {
                const group = data.groups[0];
                this.formdata.patchValue({
                    name: group.name,
                });
            }, err => {
                console.log(err);
            }
        );
    }
    remove(pub: any): void {
        const index = this.publishers.indexOf(pub);

        if (index >= 0) {
            this.publishers.splice(index, 1);
        }
    }

    selected(event: MatAutocompleteSelectedEvent): void {
        //console.log(this.publishers);
        const pub = event.option.value;
        let check = true;
        this.publishers.forEach(function (item, index) {
            if (item.uid === pub.uid) {
                check = false;
            }
        });
        if (check) {
            this.publishers.push(event.option.value);
            this.pubInput.nativeElement.value = '';
            this.publishersCtrl.setValue(null);

        }
    }
    private _filter(value: any): any[] {
        let filterValue = '';
        if (value.fullname === undefined) {
            filterValue = value.toLowerCase();
        } else {
            filterValue = value.fullname.toLowerCase();
        }
        /* console.log(filterValue); */
        return this.allPublishers.filter(pub => pub.fullname.toLowerCase().indexOf(filterValue) === 0);
    }
    editGroup() {
        this.success_msg = false;
        this.error = false;
        if (this.formdata.invalid) {
            this.error = true;
        } else {
            const data = this.formdata.value;
            if (this.publishers.length > 0) {
                data.publishers = this.publishers;
                // console.log(data);
                this.myservice.put('/group/editGroup/' + this.edit_user_id, data)
                    .subscribe(
                        res => {
                            if (res.group) {
                                this.router.navigate(['/managegroup']);
                            }
                        },
                        err => {
                            console.log(err, 'error');
                        }
                    );
            } else {
                this.error = true;
                this.pub_error = true;
            }
        }
    }

}
