import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource, MatCheckboxModule, MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Router, NavigationEnd } from '@angular/router';
import { FlashMessagesService } from 'angular2-flash-messages';

import { routerTransition } from '../../router.animations';

import { CommonService } from '../../shared/services/common.service';

@Component({
    selector: 'app-cccapping',
    templateUrl: './cccapping.component.html',
    styleUrls: ['./cccapping.component.scss'],
    animations: [routerTransition()]
})

export class CccappingComponent implements OnInit {
    pub_id;
    grid_deleted = false;
    error = false;
    selected_tfn;
    selected_pub_id = '';
    cccapping = [];
    loggedUser;
    loggedUserSettings;
    panelOpenIndex = 0;
    intervalVar;
    dataSource;

    constructor(public dialog: MatDialog, public router: Router, private myservice: CommonService,
        private _flashMessagesService: FlashMessagesService) {
        this.loggedUser = JSON.parse(localStorage.getItem('user'));
        this.loggedUserSettings = JSON.parse(localStorage.getItem('userSettings'));
    }

    ngOnInit() {
        let str = '/cappings/getAll?';
        this.myservice.get(str)
            .subscribe(result => {
                this.cccapping = result.cappings;
                let capping_keys = Object.keys(this.cccapping);
                capping_keys.map(c => {
                    this.cccapping[c].map(r => r.realtime = 0);
                });
            });
        const that = this;
        /*       this.intervalVar = setInterval(() => {
                  that.getData();
              }, 5000); */
    }
    ngOnDestroy() {
        // console.log('while leaving the destroy');
        clearInterval(this.intervalVar);
    }

    getData() {
        let str = '/cappings/realtime?';

        this.myservice.get(str)
            .subscribe(result => {
                const realtime = result.data;
                let capping_keys = Object.keys(this.cccapping);
                capping_keys.map(c => {
                    this.cccapping[c].map(r => {
                        if (realtime[r.buyer_number] !== undefined) {
                            r.realtime = realtime[r.buyer_number].length;
                        }
                    });
                });
            });
    }
    onOff(event, item) {
        // console.log(event, item);
        let data = {
            queue: item.queue,
            buyer_number: item.buyer_number,
            status: 'off'
        };

        if (event.checked) {
            data.status = 'on';
        } else {
            data.status = 'off';
        }

        this.myservice.post('/cappings/changeStatus', data)
            .subscribe(
                result => {
                    if (result.capping) {
                        this._flashMessagesService.show('Capping status is changed successfully.',
                            { cssClass: 'alert-success', timeout: 3000 });
                    }
                },
                err => {
                    console.log(err, 'error');
                }
            );

    }
    pauseUnpause(event, item) {
        // console.log(event, item);
        let data = {
            queue: item.queue,
            buyer_number: item.buyer_number,
            pause_status: 'off'
        };

        if (event.checked) {
            data.pause_status = 'pause';
        } else {
            data.pause_status = 'unpause';
        }

        this.myservice.post('/cappings/changePause', data)
            .subscribe(
                result => {
                    if (result.capping) {
                        this._flashMessagesService.show('Capping ' + data.pause_status + ' is changed successfully.', { cssClass: 'alert-success', timeout: 3000 });
                    }
                },
                err => {
                    console.log(err, 'error');
                }
            );
    }
    setPriority(item, p) {
       // console.log(item, p);
        let data = {
            queue: item.queue,
            buyer_number: item.buyer_number,
            priority: p
        };

        this.myservice.post('/cappings/changePriority', data)
            .subscribe(
                result => {
                    //console.log(result);
                    if (result.capping) {
                        this._flashMessagesService.show('Capping priority is changed to ' + data.priority + ' successfully.', { cssClass: 'alert-success', timeout: 3000 });
                        this.cccapping[item.queue].map(d => { d.priority = p; });
                    }
                },
                err => {
                    console.log(err, 'error');
                }
            );
    }
    deleteBuyer(capping_id,queue,buyer_number) {
      //  console.log(capping_id);
        if (confirm(`Are you sure to delete the Buyer Capping? All information related to the buyer and buyer numbers will be deleted.`)) {
            let dataa = {
                queue: queue,
                buyer_number: buyer_number,
                status: 'off',
                id: capping_id
            };
            console.log(dataa);
            this.myservice.post('/cappings/removeMember', dataa)
                .subscribe(
                    result => {
                        console.log(result);
                        this.router.navigate(['/cccapping']);
                            
                    },
                    err => {
                        console.log(err, 'error');
                    }
            );
            

                

        }
    }
}

