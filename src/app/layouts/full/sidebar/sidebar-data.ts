import { NavItem } from './nav-item/nav-item';

export const navItems: NavItem[] = [
  {
    navCap: 'Home',
  },
  {
    displayName: 'Dashboard',
    iconName: 'layout-dashboard',
    route: '/admin/dashboard',
  },
  {
    navCap: 'Liste',
  },
  {
    displayName: 'Manage Carousel',
    iconName: 'user-plus',
    route: '/admin/ui-components/carousel',
  },
  {
    displayName: 'Foires et Salons Management',
    iconName: 'adjustments-horizontal',
    route: '/admin/ui-components/Foires',
  },
  {
    displayName: 'Reservations',
    iconName: 'calendar-month',
    route: '/admin/ui-components/Reservation',
  },
  {
    displayName: 'Demandes Exposants',
    iconName: 'briefcase',
    route: '/admin/dashboard/exposant-requests',
  },
  {
    displayName: 'Gestion Excel',
    iconName: 'file-spreadsheet',
    route: '/admin/ui-components/excel-upload',
  },
  {
    displayName: 'Email Templates',
    iconName: 'mail',
    children: [
      {
        displayName: 'Template List',
        iconName: 'list',
        route: '/admin/ui-components/email-templates',
      },
      {
        displayName: 'Create Template',
        iconName: 'plus',
        route: '/admin/ui-components/email-templates/editor',
      },
      {
        displayName: 'Manage Invitations',
        iconName: 'users',
        route: '/admin/ui-components/email-templates/invitations',
      },
      {
        displayName: 'Send Emails',
        iconName: 'send',
        route: '/admin/ui-components/email-templates/send',
      },
      {
        displayName: 'Newsletter Subscribers',
        iconName: 'mail-opened',
        route: '/admin/ui-components/email-templates/newsletter-subscribers',
      }
    ]
  },
  {
    navCap: 'Configuration',
  },
  {
    displayName: 'Paramètres du Site',
    iconName: 'settings',
    route: '/admin/ui-components/settings',
  }

];
