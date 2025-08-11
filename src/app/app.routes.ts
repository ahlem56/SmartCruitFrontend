import { Routes } from '@angular/router';
import { HomePageComponent } from './Components/FrontOffice/home-page/home-page.component';
import { JobOffersComponent } from './Components/FrontOffice/job-offers/job-offers.component';
import { LoginComponent } from './Shared/login/login.component';
import { Sign } from 'crypto';
import { SignupComponent } from './Shared/signup/signup.component';
import { AboutUsComponent } from './Shared/about-us/about-us.component';
import { JobOffersEmployerInterfaceComponent } from './Components/EmployerInterface/job-offers/job-offers.component';
import { JobDetailsComponent } from './Components/FrontOffice/job-details/job-details.component';
import { ForgotPasswordComponent } from './Shared/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './Shared/reset-password/reset-password.component';
import { ProfileComponent } from './Shared/profile/profile.component';
import { OnboardingComponent } from './Shared/onboarding/onboarding.component';
import { DashboardComponent } from './Components/EmployerInterface/dashboard/dashboard.component';
import { EmployerGuard } from './employer.guard';
import { CandidateGuard } from './candidate.guard';
import { AdminGuard } from './admin.guard';
import { CandidatesComponent } from './Components/EmployerInterface/candidates/candidates.component';
import { CompanyComponent } from './Components/BackOffice/company/company.component';
import { SupportComponent } from './Shared/support/support.component';
import { EmployersComponent } from './Components/BackOffice/employers/employers.component';
import { AuthGuard } from './auth.guard';
import { SettingsComponent } from './Shared/settings/settings.component';
import { NotificationComponent } from './Shared/notification/notification.component';
import { FavoriteComponent } from './Shared/favorite/favorite.component';
import { DashboardAdminComponent } from './Components/BackOffice/dashboard-admin/dashboard-admin.component';
import { CandidatesBackofficeComponent } from './Components/BackOffice/candidates/candidates.component';
import { InterviewComponent } from './Shared/interview/interview.component';
import { NotFoundComponent } from './Shared/not-found/not-found.component';
import { JobOffersBackofficeComponent } from './Components/BackOffice/job-offers-backoffice/job-offers-backoffice.component';
import { TestimonialsComponent } from './Shared/testimonials/testimonials.component';

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
  { path: 'backoffice/dashboard', component: DashboardAdminComponent, canActivate: [AdminGuard] },
  { path: 'backoffice/employer-profile/:userId', component: ProfileComponent },
  { path: 'backoffice/candidates', component: CandidatesBackofficeComponent, canActivate: [AdminGuard] },
  { path: 'backoffice/candidate-profile/:userId', component: ProfileComponent, canActivate: [AdminGuard] },
  { path: 'backoffice/job-offers', component: JobOffersBackofficeComponent, canActivate: [AdminGuard] },


  { path: 'employer/dashboard', component: DashboardComponent, canActivate: [EmployerGuard] },
  { path: 'employer/job-offers', component: JobOffersEmployerInterfaceComponent, canActivate: [EmployerGuard] },
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
  { path: 'settings', component : SettingsComponent },
  { path: 'notifications', component: NotificationComponent },
  { path: 'favorites', component: FavoriteComponent },
  { path: 'interviews', component: InterviewComponent },
  { path: 'testimonials', component: TestimonialsComponent },
  { path: '**', component: NotFoundComponent },

]
