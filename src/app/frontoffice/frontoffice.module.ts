import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FrontofficeRoutingModule } from './frontoffice-routing.module';
import { FrontofficeComponent } from './frontoffice.component';
import { NavigationComponent } from './components/navigation/navigation.component';
import { HeaderComponent } from './components/header/header.component';
import { BillboardComponent } from './components/billboard/billboard.component';
import { AboutComponent } from './components/about/about.component';
import { ServicesComponent } from './components/services/services.component';
import { PortfolioComponent } from './components/portfolio/portfolio.component';
import { MilestonesComponent } from './components/milestones/milestones.component';
import { AchievementComponent } from './components/achievement/achievement.component';
import { TestimonialComponent } from './components/testimonial/testimonial.component';
import { TeamComponent } from './components/team/team.component';
import { BlogComponent } from './components/blog/blog.component';
import { FooterComponent } from './components/footer/footer.component';
import { HeroFoiresComponent } from './components/hero-foires/hero-foires.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FrontofficeV2Component } from './components/frontoffice-v2/frontoffice-v2.component';
import { HeaderSectionComponent } from './components/frontoffice-v2/sections/header-section/header-section.component';
import { HeroCarouselComponent } from './components/frontoffice-v2/sections/hero-carousel/hero-carousel.component';
import { FoiresSectionComponent } from './components/frontoffice-v2/sections/foires-section/foires-section.component';
import { AboutSectionComponent } from './components/frontoffice-v2/sections/about-section/about-section.component';
import { VideoSectionComponent } from './components/frontoffice-v2/sections/video-section/video-section.component';
import { ExposantSectionComponent } from './components/frontoffice-v2/sections/exposant-section/exposant-section.component';
import { FooterSectionComponent } from './components/frontoffice-v2/sections/footer-section/footer-section.component';
import { SafePipe } from '../pipes/safe.pipe';
import { ConditionsGeneralesComponent } from './components/conditions-generales/conditions-generales.component';
import { PolitiqueConfidentialiteComponent } from './components/politique-confidentialite/politique-confidentialite.component';
import { ReservationPageComponent } from './components/reservation-page/reservation-page.component';

@NgModule({
  declarations: [
    FrontofficeComponent,
    NavigationComponent,
    HeaderComponent,
    BillboardComponent,
    AboutComponent,
    ServicesComponent,
    PortfolioComponent,
    MilestonesComponent,
    AchievementComponent,
    TestimonialComponent,
    TeamComponent,
    BlogComponent,
    FooterComponent,
    HeroFoiresComponent,
    FrontofficeV2Component,
    HeaderSectionComponent,
    HeroCarouselComponent,
    FoiresSectionComponent,
    AboutSectionComponent,
    VideoSectionComponent,
    ExposantSectionComponent,
    FooterSectionComponent,
    SafePipe,
    ConditionsGeneralesComponent,
    PolitiqueConfidentialiteComponent,
    ReservationPageComponent
  ],
  imports: [CommonModule, FrontofficeRoutingModule, FormsModule, ReactiveFormsModule],
})
export class FrontofficeModule {}
