import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatAutocompleteSelectedEvent, MatChipInputEvent } from '@angular/material';
import { Observable } from 'rxjs';
import { switchMap, debounceTime, map, startWith } from 'rxjs/operators';
import { COMMA, ENTER } from '@angular/cdk/keycodes';

import { routerTransition } from '../../../router.animations';
import { CommonService } from '../../../shared/services/common.service';
import { PublisherService } from '../../../shared/services/publisher.service';

@Component({
    selector: 'app-add',
    templateUrl: './add.component.html',
    styleUrls: ['./group.component.scss'],
    animations: [routerTransition()]
})
export class AddComponent implements OnInit {
    isLoading = false;
    pub_error = false;
    visible = true;
    selectable = true;
    removable = true;
    addOnBlur = false;
    separatorKeysCodes: number[] = [ENTER, COMMA];
    publishersCtrl = new FormControl('');
    filteredpublishers: Observable<any>;
    publishers: any[] = [];
    allPublishers: any[] = [];
    formdata;
    error = false;
    @ViewChild('pubInput') pubInput: ElementRef<HTMLInputElement>;
    constructor(public router: Router, private activeroute: ActivatedRoute,
        private myservice: CommonService, private publisherservice: PublisherService) {
        this.publisherservice.search('').subscribe(data => this.allPublishers = data.user);
        this.filteredpublishers = this.publishersCtrl.valueChanges.pipe(
            startWith(null),
            map((pub: string | null) => pub ? this._filter(pub) : this.allPublishers.slice()));
    }

    ngOnInit() {
        this.formdata = new FormGroup({
            name: new FormControl('', Validators.compose([
                Validators.required,
                Validators.minLength(1),
            ])),
            // publishersCtrl: new FormControl(''),
        });
    }
    remove(pub: any): void {
        const index = this.publishers.indexOf(pub);

        if (index >= 0) {
            this.publishers.splice(index, 1);
        }
    }
    selected(event: MatAutocompleteSelectedEvent): void {
        // console.log(this.publishers);
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
    addGroup() {
        this.error = false;
        this.pub_error = false;
        if (this.formdata.invalid) {
            this.error = true;
        } else {
            const data = this.formdata.value;
            if (this.publishers.length > 0) {
                data.publishers = this.publishers;
                // console.log(data);
                this.myservice.post('/group/addGroup/', data)
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
