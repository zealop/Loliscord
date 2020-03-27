import { Component } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

import {IdentityDialogComponent} from './identity-dialog/identity-dialog.component';
import {SignalingService} from './services/signaling.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'loliscord';
  public currentUser: string;
  constructor(
    private signalingService: SignalingService,
    private dialog: MatDialog,
  ) 
  {}
  ngOnInit() {
    this.signalingService.initRTC();
    const dialogRef = this.dialog.open(IdentityDialogComponent, { disableClose: true });
    dialogRef.afterClosed().subscribe(rs => {
      this.currentUser = rs;
    });

  }
}
