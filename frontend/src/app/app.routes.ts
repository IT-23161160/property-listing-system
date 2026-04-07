import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/auth.guard';
import { AdminPanelPageComponent } from './pages/admin-panel-page.component';
import { AdminUserDetailsPageComponent } from './pages/admin-user-details-page.component';
import { CategoriesPageComponent } from './pages/categories-page.component';
import { FavoritesPageComponent } from './pages/favorites-page.component';
import { LoginPageComponent } from './pages/login-page.component';
import { MyBookingsPageComponent } from './pages/my-bookings-page.component';
import { ProfilePageComponent } from './pages/profile-page.component';
import { PropertyDetailsPageComponent } from './pages/property-details-page.component';
import { PropertyFormPageComponent } from './pages/property-form-page.component';
import { PropertyListPageComponent } from './pages/property-list-page.component';
import { RegisterPageComponent } from './pages/register-page.component';
import { SellerBookingsPageComponent } from './pages/seller-bookings-page.component';
import { SellerPropertiesPageComponent } from './pages/seller-properties-page.component';

export const routes: Routes = [
	{ path: '', pathMatch: 'full', redirectTo: 'properties' },
	{ path: 'login', component: LoginPageComponent },
	{ path: 'register', component: RegisterPageComponent },

	{ path: 'properties', component: PropertyListPageComponent, canActivate: [authGuard] },
	{
		path: 'properties/add',
		component: PropertyFormPageComponent,
		canActivate: [authGuard, roleGuard(['SELLER', 'ADMIN'])]
	},
	{
		path: 'properties/:id/edit',
		component: PropertyFormPageComponent,
		canActivate: [authGuard, roleGuard(['SELLER', 'ADMIN'])]
	},
	{ path: 'properties/:id', component: PropertyDetailsPageComponent, canActivate: [authGuard] },

	{ path: 'favorites', component: FavoritesPageComponent, canActivate: [authGuard, roleGuard(['BUYER'])] },
	{ path: 'bookings/my', component: MyBookingsPageComponent, canActivate: [authGuard, roleGuard(['BUYER'])] },
	{
		path: 'seller/bookings',
		component: SellerBookingsPageComponent,
		canActivate: [authGuard, roleGuard(['SELLER'])]
	},
	{
		path: 'seller/properties',
		component: SellerPropertiesPageComponent,
		canActivate: [authGuard, roleGuard(['SELLER'])]
	},

	{ path: 'profile', component: ProfilePageComponent, canActivate: [authGuard] },
	{ path: 'categories', component: CategoriesPageComponent, canActivate: [authGuard, roleGuard(['ADMIN'])] },
	{ path: 'admin', component: AdminPanelPageComponent, canActivate: [authGuard, roleGuard(['ADMIN'])] },
	{
		path: 'admin/users/:id',
		component: AdminUserDetailsPageComponent,
		canActivate: [authGuard, roleGuard(['ADMIN'])]
	},

	{ path: '**', redirectTo: 'properties' }
];
