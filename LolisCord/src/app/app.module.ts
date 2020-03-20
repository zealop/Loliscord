import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SideMenuBarComponent } from './side-menu-bar/side-menu-bar.component';
import { ChatBoxComponent } from './chat-box/chat-box.component';
import { OnlineBoardComponent } from './online-board/online-board.component';

@NgModule({
  declarations: [
    AppComponent,
    SideMenuBarComponent,
    ChatBoxComponent,
    OnlineBoardComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
