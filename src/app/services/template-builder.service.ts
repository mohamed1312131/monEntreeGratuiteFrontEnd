import { Injectable } from '@angular/core';
import { EmailTemplateConfig, AVAILABLE_DYNAMIC_FIELDS } from '../models/email-template-config.interface';

@Injectable({
  providedIn: 'root'
})
export class TemplateBuilderService {

  constructor() {}

  /**
   * Generate professional HTML email from template configuration
   */
  generateHTML(config: EmailTemplateConfig, socialLinks: any[] = []): string {
    const styles = this.generateStyles(config);
    const headerSection = this.generateHeaderSection(config);
    const contentSections = this.generateContentSections(config);
    const buttonSection = this.generateButtonSection(config);
    const gpsSection = this.generateGPSSection(config);
    const gallerySection = this.generateGallerySection(config);
    const socialSection = this.generateSocialSection(config, socialLinks);
    const footerSection = this.generateFooterSection();

    return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Template</title>
    <style>
        ${styles}
    </style>
</head>
<body>
    <div class="email-container">
        ${headerSection}
        ${contentSections}
        ${buttonSection}
        ${gpsSection}
        ${gallerySection}
        ${socialSection}
        ${footerSection}
    </div>
</body>
</html>
    `.trim();
  }

  private generateStyles(config: EmailTemplateConfig): string {
    return `
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: ${config.fontFamily || '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'};
            font-size: ${config.fontSize || '15px'};
            line-height: 1.7;
            color: #2c3e50;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px 0;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: ${config.backgroundColor || '#ffffff'};
            box-shadow: 0 10px 40px rgba(0,0,0,0.15);
            border-radius: 12px;
            overflow: hidden;
        }
        .header-image {
            width: 100%;
            height: auto;
            display: block;
            object-fit: cover;
        }
        .content-section {
            padding: 6px 35px;
        }
        .dynamic-field {
            font-weight: 700;
            color: ${config.primaryColor || '#1976D2'};
            font-size: 1.5em;
            display: block;
            margin: 8px 0;
            letter-spacing: 0.5px;
            text-align: center;
        }
        .text-content {
            margin: 8px 0;
            line-height: 1.6;
            color: ${config.contentTextColor || '#34495e'};
            text-align: center;
            font-size: 1.1em;
        }
        .cta-button {
            display: inline-block;
            padding: 16px 45px;
            background: linear-gradient(135deg, ${config.button?.backgroundColor || '#1976D2'} 0%, ${this.darkenColor(config.button?.backgroundColor || '#1976D2', 20)} 100%);
            color: ${config.button?.textColor || '#ffffff'};
            text-decoration: none;
            border-radius: 50px;
            font-weight: 600;
            margin: 25px 0;
            text-align: center;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            transition: all 0.3s ease;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            font-size: 14px;
        }
        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0,0,0,0.25);
        }
        .gps-section {
            background: ${config.gpsCoordinates?.backgroundColor || '#f5f7fa'};
            padding: 25px 35px;
            text-align: center;
            margin: 20px 0;
            border-left: 4px solid ${config.gpsCoordinates?.textColor || config.primaryColor || '#1976D2'};
            border-radius: 8px;
        }
        .gps-title {
            font-size: 1.4em;
            font-weight: 700;
            color: ${config.gpsCoordinates?.textColor || config.primaryColor || '#1976D2'};
            margin-bottom: 8px;
            letter-spacing: 1px;
        }
        .gps-subtitle {
            font-size: 0.95em;
            color: ${config.gpsCoordinates?.textColor || '#555'};
            margin-bottom: 12px;
            font-weight: 500;
        }
        .gps-link {
            display: inline-block;
            margin-top: 10px;
            padding: 10px 25px;
            background-color: ${config.gpsCoordinates?.buttonBackgroundColor || config.primaryColor || '#1976D2'};
            color: ${config.gpsCoordinates?.buttonTextColor || 'white'};
            text-decoration: none;
            border-radius: 25px;
            font-weight: 600;
            font-size: 13px;
            transition: all 0.3s ease;
        }
        .gps-link:hover {
            transform: scale(1.05);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .gallery {
            padding: 25px 35px;
        }
        .gallery-item {
            display: block;
            margin-bottom: 15px;
            width: 100%;
        }
        .gallery-item img {
            display: block;
            width: 100%;
            height: auto;
            max-height: 400px;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .social-links {
            text-align: center;
            padding: 25px 35px;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            border-top: 1px solid #e0e0e0;
        }
        .social-links a {
            display: inline-block;
            margin: 0 12px;
            width: 45px;
            height: 45px;
            line-height: 45px;
            background-color: ${config.primaryColor || '#1976D2'};
            color: white;
            text-decoration: none;
            border-radius: 50%;
            font-size: 20px;
            transition: all 0.3s ease;
            box-shadow: 0 3px 10px rgba(0,0,0,0.15);
        }
        .social-links a:hover {
            transform: translateY(-3px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.25);
        }
        .footer {
            text-align: center;
            padding: 25px 35px;
            font-size: 0.85em;
            color: #7f8c8d;
            background-color: #ecf0f1;
            border-top: 1px solid #bdc3c7;
        }
        .footer a {
            color: ${config.primaryColor || '#1976D2'};
            text-decoration: none;
            font-weight: 600;
            transition: color 0.3s ease;
        }
        .footer a:hover {
            color: ${this.darkenColor(config.primaryColor || '#1976D2', 15)};
            text-decoration: underline;
        }
        .divider {
            height: 2px;
            background: linear-gradient(90deg, transparent, ${config.primaryColor || '#1976D2'}, transparent);
            margin: 15px 0;
            border: none;
        }
        @media only screen and (max-width: 600px) {
            body {
                padding: 10px 0;
            }
            .email-container {
                width: 100% !important;
                border-radius: 0;
            }
            .content-section {
                padding: 10px 20px;
            }
            .gallery {
                gap: 10px;
                padding: 15px 20px;
            }
            .gallery img {
                max-height: 300px;
            }
            .cta-button {
                padding: 14px 35px;
                font-size: 13px;
            }
            .dynamic-field {
                font-size: 1.1em;
            }
        }
    `;
  }

  private generateHeaderSection(config: EmailTemplateConfig): string {
    if (!config.headerImage?.url) return '';
    return `
        <div class="header-section">
            <img src="${config.headerImage.url}" alt="${config.headerImage.alt || 'Header'}" class="header-image" style="width: 100%; height: auto; display: block; object-fit: cover;">
        </div>
    `;
  }

  private generateContentSections(config: EmailTemplateConfig): string {
    if (!config.sections || config.sections.length === 0) return '';
    
    return config.sections.map(section => {
      const styles = section.styles || {};
      const baseFontSize = config.fontSize || '16px';
      const fontSize = styles.fontSize || (section.type === 'dynamic-field' ? '24px' : '18px');
      const textColor = styles.color || config.contentTextColor || '#34495e';
      const primaryColor = config.primaryColor || '#1976D2';
      
      const styleAttr = `style="
        font-size: ${fontSize};
        ${styles.fontWeight ? `font-weight: ${styles.fontWeight};` : ''}
        ${styles.textAlign ? `text-align: ${styles.textAlign};` : 'text-align: center;'}
        color: ${textColor};
        ${styles.marginTop ? `margin-top: ${styles.marginTop};` : ''}
        ${styles.marginBottom ? `margin-bottom: ${styles.marginBottom};` : ''}
        white-space: pre-wrap;
        line-height: 1.6;
        margin: 8px 0;
      "`;

      if (section.type === 'dynamic-field') {
        const dynamicFieldStyle = `style="font-weight: 700; color: ${primaryColor}; font-size: 1.5em; display: block; margin: 8px 0; letter-spacing: 0.5px; text-align: center;"`;
        return `<div class="content-section" style="padding: 6px 35px;"><span class="dynamic-field" ${dynamicFieldStyle}>${section.dynamicField}</span></div>`;
      } else if (section.type === 'text') {
        const content = section.content || '';
        return `<div class="content-section" style="padding: 6px 35px;"><div class="text-content" ${styleAttr}>${content}</div></div>`;
      } else if (section.type === 'divider') {
        const dividerStyle = `style="height: 2px; background: linear-gradient(90deg, transparent, ${primaryColor}, transparent); margin: 15px 0; border: none;"`;
        return `<div class="content-section" style="padding: 6px 35px;"><hr class="divider" ${dividerStyle}></div>`;
      } else if (section.type === 'spacer') {
        return `<div style="height: ${styles.marginTop || '10px'};"></div>`;
      }
      return '';
    }).join('');
  }

  private generateButtonSection(config: EmailTemplateConfig): string {
    if (!config.button?.text) return '';
    const buttonLink = config.button.link && config.button.link.trim() !== '' ? config.button.link : 'https://example.com';
    const buttonBgColor = config.button.backgroundColor || '#1976D2';
    const buttonTextColor = config.button.textColor || '#ffffff';
    return `
        <div class="content-section" style="text-align: center;">
            <a href="${buttonLink}" target="_blank" class="cta-button" style="display: inline-block; padding: 16px 45px; background: linear-gradient(135deg, ${buttonBgColor} 0%, ${this.darkenColor(buttonBgColor, 20)} 100%); color: ${buttonTextColor}; text-decoration: none; border-radius: 50px; font-weight: 600; margin: 25px 0; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.2); letter-spacing: 0.5px; text-transform: uppercase; font-size: 14px; cursor: pointer;">${config.button.text}</a>
        </div>
    `;
  }

  private generateGPSSection(config: EmailTemplateConfig): string {
    if (!config.gpsCoordinates?.enabled) return '';
    const gpsBgColor = config.gpsCoordinates.backgroundColor || '#f5f7fa';
    const gpsTextColor = config.gpsCoordinates.textColor || config.primaryColor || '#1976D2';
    const gpsButtonBgColor = config.gpsCoordinates.buttonBackgroundColor || config.primaryColor || '#1976D2';
    const gpsButtonTextColor = config.gpsCoordinates.buttonTextColor || 'white';
    
    return `
        <div class="content-section">
            <div class="gps-section" style="background: ${gpsBgColor}; padding: 25px 35px; text-align: center; margin: 20px 0; border-left: 4px solid ${gpsTextColor}; border-radius: 8px;">
                <div class="gps-title" style="font-size: 1.4em; font-weight: 700; color: ${gpsTextColor}; margin-bottom: 8px; letter-spacing: 1px;">${config.gpsCoordinates.label || 'COORDONNÉES GPS'}</div>
                <div class="gps-subtitle" style="font-size: 0.95em; color: ${gpsTextColor}; margin-bottom: 12px; font-weight: 500;">ENTRÉE PRINCIPALE</div>
                ${config.gpsCoordinates.latitude && config.gpsCoordinates.longitude ? 
                  `<a href="https://www.google.com/maps?q=${config.gpsCoordinates.latitude},${config.gpsCoordinates.longitude}" 
                      class="gps-link" style="display: inline-block; margin-top: 10px; padding: 10px 25px; background-color: ${gpsButtonBgColor}; color: ${gpsButtonTextColor}; text-decoration: none; border-radius: 25px; font-weight: 600; font-size: 13px;">
                      📍 Voir sur Google Maps
                  </a>` : ''}
            </div>
        </div>
    `;
  }

  private generateGallerySection(config: EmailTemplateConfig): string {
    if (!config.galleryImages || config.galleryImages.length === 0) return '';
    const images = config.galleryImages.map((url, index) => 
      `<div class="gallery-item" style="display: block; margin-bottom: 15px; width: 100%;"><img src="${url}" alt="Gallery Image ${index + 1}" style="display: block; width: 100%; height: auto; max-height: 400px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);"></div>`
    ).join('');
    return `<div class="gallery" style="padding: 25px 35px;">${images}</div>`;
  }

  private generateSocialSection(config: EmailTemplateConfig, socialLinks: any[]): string {
    if (!config.includeSocialLinks || !socialLinks || socialLinks.length === 0) return '';
    
    const primaryColor = config.primaryColor || '#1976D2';
    const links = socialLinks.map(link => {
      const icon = this.getSocialIcon(link.platform);
      return `<a href="${link.url}" target="_blank" title="${link.platform}" style="display: inline-block; margin: 0 12px; width: 45px; height: 45px; line-height: 45px; background-color: ${primaryColor}; color: white; text-decoration: none; border-radius: 50%; font-size: 20px; box-shadow: 0 3px 10px rgba(0,0,0,0.15);">${icon}</a>`;
    }).join('');
    
    return `<div class="social-links" style="text-align: center; padding: 25px 35px; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); border-top: 1px solid #e0e0e0;">${links}</div>`;
  }

  private getSocialIcon(platform: string): string {
    const icons: any = {
      'facebook': '📘',
      'twitter': '🐦',
      'instagram': '📷',
      'linkedin': '💼',
      'youtube': '▶️'
    };
    return icons[platform.toLowerCase()] || '🔗';
  }

  private generateFooterSection(): string {
    return `
        <div class="footer" style="text-align: center; padding: 25px 35px; font-size: 0.85em; color: #7f8c8d; background-color: #ecf0f1; border-top: 1px solid #bdc3c7;">
            <p style="margin: 0;">Pour être retiré de notre liste de diffusion, vous pouvez vous <a href="{{UNSUBSCRIBE_LINK}}" style="color: #1976D2; text-decoration: underline; font-weight: 600;">désinscrire</a></p>
        </div>
    `;
  }

  /**
   * Replace dynamic fields with sample data for preview
   */
  replaceDynamicFields(html: string): string {
    AVAILABLE_DYNAMIC_FIELDS.forEach(field => {
      const regex = new RegExp(field.key.replace(/[{}]/g, '\\$&'), 'gi');
      html = html.replace(regex, field.placeholder);
    });
    return html;
  }

  /**
   * Helper method to darken a color by a percentage
   */
  private darkenColor(color: string, percent: number): string {
    // Handle hex colors
    if (color.startsWith('#')) {
      const num = parseInt(color.replace('#', ''), 16);
      const amt = Math.round(2.55 * percent);
      const R = (num >> 16) - amt;
      const G = (num >> 8 & 0x00FF) - amt;
      const B = (num & 0x0000FF) - amt;
      return '#' + (
        0x1000000 +
        (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
        (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
        (B < 255 ? (B < 1 ? 0 : B) : 255)
      ).toString(16).slice(1);
    }
    return color;
  }
}
