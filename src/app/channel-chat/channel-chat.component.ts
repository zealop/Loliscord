import { Component, OnInit, Input, SimpleChanges, ViewChild, ViewChildren, QueryList, ElementRef } from '@angular/core';
import {SignalingService} from 'src/app/services/signaling.service';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {CdkTextareaAutosize} from '@angular/cdk/text-field';
interface Messages {
  user: string;
  content: string;
  timeStamp: string;
}
@Component({
  selector: 'app-channel-chat',
  templateUrl: './channel-chat.component.html',
  styleUrls: ['./channel-chat.component.scss']
})
export class ChannelChatComponent implements OnInit {
  @Input() currentUser: string;
  isLoading: boolean = true;
  constructor(
    private signalingService: SignalingService,
  ) 
  { }
  
  public messages: Array<Messages> = [];
  ngOnInit(): void {
    this.signalingService.msgSubject.subscribe((event) => {
      console.log(event);
      if(event.data == "CONNECTED") {
        this.isLoading = false;
      }
      else this.onNewMessage(JSON.parse(event.data));
    });
  }

  @ViewChildren('msg') msgView: QueryList<ElementRef>;
  ngAfterViewInit() {
    this.msgView.changes.subscribe(() => {
      
      if(this.msgView && this.msgView.last) {
        console.log(this.msgView.last.nativeElement);
        this.msgView.last.nativeElement.scrollIntoView();
      }
    });
  }
  sendMessage(event) {
    if(event.which == 13 && !event.altKey) {
      event.preventDefault();
      const today = new Date();
      const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
      const obj = {
        user: this.currentUser,
        content: event.target.value,
        timeStamp: time,
      }
      this.onNewMessage(obj);
      this.signalingService.sendMessage(JSON.stringify(obj));
      event.target.value ='';
    }   
  }
  
  onNewMessage(msg: Messages) {
    this.messages.push(msg);
  }
}
