import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { switchMap, debounceTime } from 'rxjs/operators';
import { routerTransition } from '../../../router.animations';
import { CommonService } from '../../../shared/services/common.service';
import { PublisherService } from '../../../shared/services/publisher.service';
@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss'],
  animations: [routerTransition()]

})
export class AddComponent implements OnInit {


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
  }


  addActiveHour() {

    this.error = false;

    if (this.formdata.invalid) {
      this.error = true;
    } else {

      const data = this.formdata.value;
      data.pub_id = this.selected_pub_id;

      data.enable_from = this.changeTimeData(data.active_on.hour) + ':' + this.changeTimeData(data.active_on.minute) + ':00';
      data.enable_till = this.changeTimeData(data.active_off.hour) + ':' + this.changeTimeData(data.active_off.minute) + ':00';


      this.myservice.post('/addFinanceHours', data)
        .subscribe(
          result => {
            if (result.financeHour) {
              this.router.navigate(['/financehours']);
            }
            if (result.success === 'NOK') {
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

  changeTimeData(d) {

    return (1 === d.toString().length) ? '0' + d : d;
  }

}

