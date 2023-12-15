import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EmployerFeatureProfileService } from './employer-feature-profile.service';
import { publicFeatureProfileRoutes } from './lib.routes';

@NgModule({
  imports: [CommonModule, RouterModule.forChild(publicFeatureProfileRoutes)],
  providers: [EmployerFeatureProfileService],
})
export class EmployerFeatureProfileModule {}
