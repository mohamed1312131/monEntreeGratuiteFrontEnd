import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-conditions-generales',
  templateUrl: './conditions-generales.component.html',
  styleUrls: ['./conditions-generales.component.scss']
})
export class ConditionsGeneralesComponent implements OnInit, AfterViewInit {

  constructor(
    private titleService: Title,
    private metaService: Meta,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle('Conditions Générales - Mon Entrée Gratuite');
    this.metaService.updateTag({
      name: 'description',
      content: 'Conditions générales d\'utilisation du site Mon Entrée Gratuite'
    });
  }

  ngAfterViewInit(): void {
    // Handle fragment navigation (e.g., #article1)
    this.route.fragment.subscribe(fragment => {
      if (fragment) {
        setTimeout(() => {
          this.scrollToSection(fragment);
        }, 100);
      }
    });
  }

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
