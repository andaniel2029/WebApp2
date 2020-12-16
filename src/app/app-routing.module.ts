import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CountComponent } from './views/count/count.component';
import { MainComponent } from './views/main/main.component';

const routes: Routes = [{path: '', component: MainComponent}, {path:'count', component: CountComponent}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
