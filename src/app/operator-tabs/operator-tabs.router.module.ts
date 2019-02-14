import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { OperatorTabsPage } from './operator-tabs.page';
import { CommunityPage } from '../community/community.page';
import { ProfilePage } from '../profile/profile.page';

const routes: Routes = [
  {
    path: 'operator-tabs',
    component: OperatorTabsPage,
    children: [
      {
        path: '',
        redirectTo: '/operator-tabs/(community:community)',
        pathMatch: 'full',
      },
      {
        path: 'community',
        outlet: 'community',
        component: CommunityPage
      },
      {
        path: 'profile',
        outlet: 'profile',
        component: ProfilePage
      }
    ]
  },
  {
    path: '',
    redirectTo: '/operator-tabs/(community:community)',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OperatorTabsPageRoutingModule {}
