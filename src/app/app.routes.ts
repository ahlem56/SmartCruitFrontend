import { Routes } from '@angular/router';
import { HomePageComponent } from './Components/FrontOffice/home-page/home-page.component';
import { JobOffersComponent } from './Components/FrontOffice/job-offers/job-offers.component';
import { LoginComponent } from './Shared/login/login.component';
import { Sign } from 'crypto';
import { SignupComponent } from './Shared/signup/signup.component';
import { AboutUsComponent } from './Shared/about-us/about-us.component';
import { JobOffersBackofficeComponent } from './Components/EmployerInterface/job-offers/job-offers.component';
import { JobDetailsComponent } from './Components/FrontOffice/job-details/job-details.component';
import { ForgotPasswordComponent } from './Shared/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './Shared/reset-password/reset-password.component';
import { ProfileComponent } from './Shared/profile/profile.component';
import { OnboardingComponent } from './Shared/onboarding/onboarding.component';
import { PostJobOffersComponent } from './Components/EmployerInterface/post-job-offers/post-job-offers.component';
import { DashboardComponent } from './Components/BackOffice/dashboard/dashboard.component';
import { EmployerGuard } from './employer.guard';
import { CandidateGuard } from './candidate.guard';
import { AdminGuard } from './admin.guard';
import { CandidatesComponent } from './Components/EmployerInterface/candidates/candidates.component';
import { CompanyComponent } from './Components/BackOffice/company/company.component';
import { SupportComponent } from './Shared/support/support.component';
import { EmployersComponent } from './Components/BackOffice/employers/employers.component';
import { AuthGuard } from './auth.guard';

export const routes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'home', component: HomePageComponent, canActivate: [CandidateGuard] },
  { path: 'job-offers', component: JobOffersComponent, canActivate: [CandidateGuard] },
  { path: 'job-details/:id', component: JobDetailsComponent, canActivate: [CandidateGuard] },
  {
    path: 'chat',
    loadComponent: () => import('./Shared/chat/chat.component').then(m => m.ChatComponent),
    canActivate: [AuthGuard] // ✅ Replace CandidateGuard
  },  
  
  { path: 'backoffice/company', component: CompanyComponent, canActivate: [AdminGuard] },
  { path: 'backoffice/employers', component: EmployersComponent, canActivate: [AdminGuard] },
  { path: 'backoffice/dashboard', component: DashboardComponent, canActivate: [AdminGuard] },



  { path: 'employer/dashboard', component: DashboardComponent, canActivate: [EmployerGuard] },
  { path: 'employer/job-offers', component: JobOffersBackofficeComponent, canActivate: [EmployerGuard] },
  { path: 'employer/post-job-offers', component: PostJobOffersComponent, canActivate: [EmployerGuard] },
  { path: 'employer/job-offers/:id/candidates',loadComponent: () => import('./Components/EmployerInterface/candidates/candidates.component').then(m => m.CandidatesComponent),canActivate: [EmployerGuard]},  


  // Auth routes (accessible to both)
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'aboutUs', component: AboutUsComponent },
  { path: 'onboarding', component: OnboardingComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'support', component: SupportComponent },

]
