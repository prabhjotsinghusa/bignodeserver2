import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { switchMap, debounceTime } from 'rxjs/operators';
import { routerTransition } from '../../../router.animations';
import { CommonService } from '../../../shared/services/common.service';
import { PublisherService } from '../../../shared/services/publisher.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
  animations: [routerTransition()]
})
export class EditComponent implements OnInit {

  constructor(
    public router: Router,
    private myservice: CommonService,
    private activeroute: ActivatedRoute,
    private publisherservice: PublisherService


  ) { }


  formdata;
  error = false;
  show_error = false;
  error_message = ``;
  isLoading = false;
  selected_pub_id = 0;
  edit_finance_id = 0;
  edit_pub_id = 0;
  minuteStep = 15;
  filteredPublishers: Observable<any>;

  ngOnInit() {

    this.formdata = new FormGroup({
      pub_id: new FormControl('', Validators.required),

      active_on: new FormControl('', Validators.compose([
        Validators.required,
      ])),
      active_off: new FormControl('', Validators.compose([
        Validators.required,
      ])),
    });


    this.filteredPublishers = this.formdata.get('pub_id').valueChanges.pipe(
      debounceTime(200),
      switchMap(value => this.publisherservice.search(value))
    );

    /* get url variables */
    this.activeroute.params.subscribe(params => {

      this.edit_finance_id = params.id;
    });

    this.myservice.get('/getFinanceHourById/' + this.edit_finance_id).subscribe(
      data => {

        var finance = data.financeHour[0];
        this.edit_pub_id = finance.pub_id;
        //console.log(activehour);
        const active_on = this.changeValueStrToTime(finance.enable_from);
        const active_off = this.changeValueStrToTime(finance.enable_till);

        this.formdata.patchValue({
          pub_id: finance.pub_id,
          active_on: active_on,
          active_off: active_off,
        });

        if (this.edit_pub_id > 0) {

          /* getting the publisher name and id */
          this.myservice.get('/publisher/getPublishers/' + this.edit_pub_id).subscribe(
            data => {
              var user = data.user;
              this.formdata.patchValue({
                pub_id: { uid: user.uid, fullname: user.fullname },
              });

            }, err => {
              console.log(err);
            }
          );
        }

      }, err => {
        console.log(err);
      }
    );

  }


  editActiveHour() {

    this.error = false;
    // this.password_error = false;
    if (this.formdata.invalid) {
      this.error = true;
    } else {
      const data = this.formdata.value;
      data.pub_id = this.selected_pub_id;

      data.active_on = this.changeTimeData(data.active_on.hour) + ':' + this.changeTimeData(data.active_on.minute) + ':00';
      data.active_off = this.changeTimeData(data.active_off.hour) + ':' + this.changeTimeData(data.active_off.minute) + ':00';
      
      this.myservice.put('/editFinanceHours/' + this.edit_finance_id, data)
        .subscribe(

          data => {
            if (data.tfn) {
              this.router.navigate(['/financehours']);
            }
          },

          err => {
            console.log(err, 'error');
          }
        );

    }
  }

  hideLoader() {

    this.isLoading = false;
    const p = this.formdata.get('pub_id').value;

    this.selected_pub_id = p.uid;
  }
  showLoader() {
    this.isLoading = true;
  }

  displayFn(publisher) {
    if (publisher) { return publisher.fullname; }
  }
  changeValueStrToTime(d) {
    const arr = d.split(':');
    return { hour: parseInt(arr[0], 10), minute: parseInt(arr[1], 10) };
  }
  changeTimeData(d) {

    return (1 === d.toString().length) ? '0' + d : d;
  }
}
