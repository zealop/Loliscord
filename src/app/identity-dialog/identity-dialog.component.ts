import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-identity-dialog',
  templateUrl: './identity-dialog.component.html',
  styleUrls: ['./identity-dialog.component.scss']
})
export class IdentityDialogComponent implements OnInit {
  currentUser: string = 'Linh';
  constructor(
  ) { }

  ngOnInit(): void {
  }
  @ViewChild('ok') ok: any;
  confirmName(event) {
    if(event.which == 13) {
      this.ok._elementRef.nativeElement.click();
    }
  }
}
