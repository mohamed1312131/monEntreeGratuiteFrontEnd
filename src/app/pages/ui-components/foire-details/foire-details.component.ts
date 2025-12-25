import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-foire-details',
  templateUrl: './foire-details.component.html',
  styleUrls: ['./foire-details.component.scss']
})
export class FoireDetailsComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
}
