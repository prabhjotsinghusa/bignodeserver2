import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Observable, iif } from 'rxjs';
import { FlashMessagesService } from 'ngx-flash-messages';
import { routerTransition } from '../../../router.animations';
import { CommonService } from '../../../shared/services/common.service';
import { BuyerService } from '../../../shared/services/buyer.service';
import { Router } from "@angular/router";
import { switchMap, debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss'],
  animations: [routerTransition()]
})
export class AddComponent implements OnInit {

  filesToUpload: Array<File> = [];
  loggedUser;
  formdata;
  isLoading;
  isLoadingTable = false;
  flashMessage = false;
  selected_buyer_id = 0;
  filteredBuyer: Observable<any>;

  @ViewChild('fileImportInput') fileImportInput: ElementRef;

  constructor(

    private commonService: CommonService,
    private buyerService: BuyerService,
    private flashMessagesService: FlashMessagesService,
    private router: Router

  ) {
    this.loggedUser = JSON.parse(localStorage.getItem('user'));
  }

  ngOnInit() {

    this.formdata = new FormGroup(
      {
        buyer: new FormControl(''),
      });

    this.filteredBuyer = this.formdata.get('buyer').valueChanges.pipe(
      debounceTime(200),
      switchMap(value => this.buyerService.search(value))
    );

  }

  hideLoader() {
    this.isLoading = false;
    const p = this.formdata.get('buyer').value.buyer_id;
    this.selected_buyer_id = p;
  }
  showLoader() {
    this.isLoading = true;
  }
  searchWithFilter() {

    this.isLoadingTable = true;
    const data = this.formdata.value;
    if (data.buyer > 0) {
      data.buyer = data.buyer;
    }

  }

  displayFn(buyer) {
    if (buyer) {
      return buyer.name;
    }
  }

  uploadAudioFile(files: File[]) {

    this.isLoadingTable = true;
    const frmData = new FormData();

    Array.from(files).forEach(f => {

      frmData.append('file', f);

      // console.log(this.selected_buyer_id,"================");
      if (this.selected_buyer_id > 0) {
        const query = `/audio/uploadAudio?buyer_id=${this.selected_buyer_id}`;

        this.commonService.fileUpload(query, frmData)
          .subscribe(
            data => {

              this.isLoadingTable = false;
              if (data.success === 'OK') {

                setTimeout(() => {
                  this.flashMessagesService.show('Audio file uploaded successfully', {
                    classes: ['success', 'alert-warning'], // You can pass as many classes as you need
                    timeout: 5000, // Default is 3000
                  });
                }, 4000);

                this.router.navigate(['/audio']);

              } else {
                this.flashMessagesService.show('Audio file failed to upload!', {
                  classes: ['alert', 'alert-warning'], // You can pass as many classes as you need
                  timeout: 5000, // Default is 3000
                });

              }
            },
            err => {
              this.isLoadingTable = false;
              console.log(err, 'error');
            }
          );
      } else {
        this.flashMessagesService.show('Please select buyer first!', {
          classes: ['alert', 'alert-danger'], // You can pass as many classes as you need
          timeout: 5000, // Default is 3000
        });
        this.isLoadingTable = false;
      }

    });
    return false;
  }

  reset() {
    this.fileImportInput.nativeElement.value = '';
  }
}
