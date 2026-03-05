import { Routes } from '@angular/router';
import { MainViewComponent } from './views/public/pages/mainview/mainview.component';
import { LoginPageComponent } from './views/public/pages/login-page/login-page.component';

export const routes: Routes = [
  { path: '', component: MainViewComponent },
  { path: 'login', component: LoginPageComponent}
];

