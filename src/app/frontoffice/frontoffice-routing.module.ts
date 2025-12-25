import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FrontofficeComponent } from './frontoffice.component';
import { ConditionsGeneralesComponent } from './components/conditions-generales/conditions-generales.component';
import { PolitiqueConfidentialiteComponent } from './components/politique-confidentialite/politique-confidentialite.component';


const routes: Routes = [
  {
    path: '',
    component: FrontofficeComponent,
  },
  {
    path: 'conditions-generales',
    component: ConditionsGeneralesComponent,
  },
  {
    path: 'politique-confidentialite',
    component: PolitiqueConfidentialiteComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FrontofficeRoutingModule {}
