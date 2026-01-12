import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TemplateViewerComponent } from './template-viewer.component';

const routes: Routes = [
  {
    path: '',
    component: TemplateViewerComponent
  }
];

@NgModule({
  imports: [
    TemplateViewerComponent,
    RouterModule.forChild(routes)
  ]
})
export class TemplateViewerModule { }
