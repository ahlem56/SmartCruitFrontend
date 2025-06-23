import {
    GoogleLoginProvider,
    SocialAuthServiceConfig
  } from '@abacritt/angularx-social-login';
  
  export const socialConfig: SocialAuthServiceConfig = {
    autoLogin: false,
    providers: [
      {
        id: GoogleLoginProvider.PROVIDER_ID,
        provider: new GoogleLoginProvider(
          '559943847914-138movu7ml236e7d3fbtnmd4gpdpm2ag.apps.googleusercontent.com'
        )
      }
    ]
  };
  