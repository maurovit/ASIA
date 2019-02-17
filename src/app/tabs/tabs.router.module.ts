import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TabsPage } from './tabs.page';
import { CommunityPage } from '../community/community.page';
import { ProfilePage } from '../profile/profile.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: '',
        redirectTo: '/tabs/(community:community)',
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
    redirectTo: '/tabs/(community:community)',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsPageRoutingModule {}
