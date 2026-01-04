export interface EmailTemplateConfig {
  // Styling
  backgroundColor: string;
  fontFamily: string;
  fontSize: string;
  primaryColor: string;
  secondaryColor: string;
  contentTextColor?: string;
  
  // Header Section
  headerImage?: {
    url: string;
    alt: string;
  };
  
  // Content Sections
  sections: TemplateSection[];
  
  // Button Configuration
  button?: {
    text: string;
    link: string;
    backgroundColor: string;
    textColor: string;
  };
  
  // GPS Coordinates
  gpsCoordinates?: {
    enabled: boolean;
    latitude?: string;
    longitude?: string;
    label?: string;
    backgroundColor?: string;
    textColor?: string;
    buttonBackgroundColor?: string;
    buttonTextColor?: string;
  };
  
  // Gallery Images
  galleryImages: string[];
  
  // Social Links (fetched from settings)
  includeSocialLinks: boolean;
  
  // Footer
  includeUnsubscribe: boolean;
}

export interface TemplateSection {
  id: string;
  type: 'text' | 'dynamic-field' | 'divider' | 'spacer';
  content?: string;
  dynamicField?: string;
  styles?: {
    fontSize?: string;
    fontWeight?: string;
    textAlign?: string;
    color?: string;
    marginTop?: string;
    marginBottom?: string;
  };
}

export interface DynamicFieldOption {
  key: string;
  label: string;
  placeholder: string;
  description: string;
}

export const AVAILABLE_DYNAMIC_FIELDS: DynamicFieldOption[] = [
  { key: '{{NOM}}', label: 'Nom', placeholder: 'Ahmed Ben Ali', description: 'Recipient name' },
  { key: '{{EMAIL}}', label: 'Email', placeholder: 'ahmed@example.com', description: 'Recipient email' },
  { key: '{{DATE}}', label: 'Date', placeholder: '15/01/2024', description: 'Event date' },
  { key: '{{HEURE}}', label: 'Heure', placeholder: '09:23', description: 'Event time' },
  { key: '{{CODE}}', label: 'Code', placeholder: 'A7B3C9', description: 'Ticket code' },
  { key: '{{FOIRE_NAME}}', label: 'Nom de la Foire', placeholder: 'Notre Foire', description: 'Fair name' }
];

export const FONT_FAMILIES = [
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: 'Helvetica, sans-serif', label: 'Helvetica' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'Times New Roman, serif', label: 'Times New Roman' },
  { value: 'Verdana, sans-serif', label: 'Verdana' },
  { value: 'Courier New, monospace', label: 'Courier New' },
  { value: 'Trebuchet MS, sans-serif', label: 'Trebuchet MS' }
];

export const FONT_SIZES = [
  { value: '12px', label: 'Small (12px)' },
  { value: '14px', label: 'Normal (14px)' },
  { value: '16px', label: 'Medium (16px)' },
  { value: '18px', label: 'Large (18px)' },
  { value: '20px', label: 'Extra Large (20px)' }
];

export const PRESET_COLORS = [
  '#FFFFFF', '#F5F5F5', '#E0E0E0', '#BDBDBD',
  '#000000', '#212121', '#424242', '#616161',
  '#1976D2', '#2196F3', '#03A9F4', '#00BCD4',
  '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B',
  '#FF9800', '#FF5722', '#F44336', '#E91E63',
  '#9C27B0', '#673AB7', '#3F51B5', '#009688'
];
