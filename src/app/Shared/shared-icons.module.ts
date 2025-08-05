// shared-icons.module.ts
import { NgModule } from '@angular/core';
import { LucideAngularModule, Heart } from 'lucide-angular';

@NgModule({
  imports: [LucideAngularModule.pick({ Heart })],
  exports: [LucideAngularModule]
})
export class SharedIconsModule {}
