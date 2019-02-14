import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { OperatorTabsPage } from './operator-tabs.page';

import { ProfilePageModule } from '../profile/profile.module';
import { CommunityPageModule } from '../community/community.module';

import { OperatorTabsPageRoutingModule } from './operator-tabs.router.module';

const routes: Routes = [
  {
    path: '',
    component: OperatorTabsPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    OperatorTabsPageRoutingModule,
    CommunityPageModule,
    ProfilePageModule
  ],
  declarations: [OperatorTabsPage]
})
export class OperatorTabsPageModule {}
