import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { WrappedComponent } from './pages/wrapped/wrapped.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'wrapped/:username', component: WrappedComponent },
  { path: '**', redirectTo: '' },
];
