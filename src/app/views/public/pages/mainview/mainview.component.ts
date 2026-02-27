import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PublicHeaderComponent } from '../../../../subsystems/display/layout/public-header/public-header.component';

@Component({
  selector: 'app-mainview',
  templateUrl: './mainview.component.html',
  styleUrls: ['./mainview.component.scss'],
  imports: [RouterModule, CommonModule, PublicHeaderComponent]
})
export class MainViewComponent {
 
}