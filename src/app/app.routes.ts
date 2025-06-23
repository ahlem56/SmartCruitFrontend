import { Routes } from '@angular/router';
import { HomePageComponent } from './Components/FrontOffice/home-page/home-page.component';
import { JobOffersComponent } from './Components/FrontOffice/job-offers/job-offers.component';
import { LoginComponent } from './Shared/login/login.component';
import { Sign } from 'crypto';
import { SignupComponent } from './Shared/signup/signup.component';
import { AboutUsComponent } from './Shared/about-us/about-us.component';
import { JobOffersBackofficeComponent } from './Components/BackOffice/job-offers/job-offers.component';
import { JobDetailsComponent } from './Components/FrontOffice/job-details/job-details.component';
import { ForgotPasswordComponent } from './Shared/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './Shared/reset-password/reset-password.component';
import { ProfileComponent } from './Shared/profile/profile.component';

export const routes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'home', component: HomePageComponent },
  { path: 'job-offers', component: JobOffersComponent },
  { path: 'backoffice/job-offers', component: JobOffersBackofficeComponent },
  {path:'login', component: LoginComponent },
  {path: 'signup', component: SignupComponent },
  {path: 'aboutUs', component: AboutUsComponent },
  {path: 'job-details', component: JobDetailsComponent },
  {path: 'forgot-password', component: ForgotPasswordComponent },
  {path: 'reset-password', component: ResetPasswordComponent },
  {path: 'profile', component: ProfileComponent },
];
