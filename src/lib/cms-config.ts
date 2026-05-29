export type FieldType = 'text' | 'textarea' | 'image';

export interface CMSField {
  name: string;
  label: string;
  type: FieldType;
  description?: string;
}

export interface CMSSection {
  id: string;
  title: string;
  fields: CMSField[];
}

export interface CMSPageConfig {
  id: string;
  title: string;
  sections: CMSSection[];
}

export const cmsConfig: Record<string, CMSPageConfig> = {
  home: {
    id: 'home',
    title: 'Home Page',
    sections: [
      {
        id: 'hero',
        title: 'Hero Section',
        fields: [
          { name: 'heroTitle1', label: 'Title Line 1', type: 'text' },
          { name: 'heroTitle2', label: 'Title Line 2 (Italic)', type: 'text' },
          { name: 'heroDesc', label: 'Description', type: 'textarea' },
          { name: 'reserveBtn', label: 'Reserve Button Text', type: 'text' },
          { name: 'exploreBtn', label: 'Explore Button Text', type: 'text' },
          { name: 'scroll', label: 'Scroll Text', type: 'text' },
          { name: 'heroBgImage', label: 'Background Image', type: 'image' },
        ],
      },
      {
        id: 'experience',
        title: 'The Experience',
        fields: [
          { name: 'experienceLabel', label: 'Section Label', type: 'text' },
          { name: 'experienceTitle1', label: 'Title Line 1', type: 'text' },
          { name: 'experienceTitle2', label: 'Title Line 2', type: 'text' },
          { name: 'experienceTitle3', label: 'Title Line 3', type: 'text' },
          { name: 'experienceDesc', label: 'Description', type: 'textarea' },
          { name: 'feature1', label: 'Feature 1', type: 'text' },
          { name: 'feature2', label: 'Feature 2', type: 'text' },
          { name: 'feature3', label: 'Feature 3', type: 'text' },
          { name: 'experienceImage', label: 'Experience Image', type: 'image' },
        ],
      },
      {
        id: 'archive',
        title: 'Portfolio Glimpses',
        fields: [
          { name: 'archiveLabel', label: 'Section Label', type: 'text' },
          { name: 'archiveTitle', label: 'Title', type: 'text' },
          { name: 'viewPortfolio', label: 'View Portfolio Link', type: 'text' },
          { name: 'gallery1', label: 'Gallery 1 Title', type: 'text' },
          { name: 'gallery2', label: 'Gallery 2 Title', type: 'text' },
          { name: 'gallery3', label: 'Gallery 3 Title', type: 'text' },
          { name: 'gallery1Image', label: 'Gallery 1 Image', type: 'image' },
          { name: 'gallery2Image', label: 'Gallery 2 Image', type: 'image' },
          { name: 'gallery3Image', label: 'Gallery 3 Image', type: 'image' },
        ],
      },
      {
        id: 'newsletter',
        title: 'Newsletter',
        fields: [
          { name: 'newsletterTitle1', label: 'Title Line 1', type: 'text' },
          { name: 'newsletterTitle2', label: 'Title Line 2', type: 'text' },
          { name: 'newsletterDesc', label: 'Description', type: 'textarea' },
          { name: 'emailPlaceholder', label: 'Email Placeholder', type: 'text' },
          { name: 'subscribeBtn', label: 'Subscribe Button', type: 'text' },
        ],
      }
    ]
  },
  portfolio: {
    id: 'portfolio',
    title: 'Portfolio Page',
    sections: [
      {
        id: 'header',
        title: 'Header Section',
        fields: [
          { name: 'title', label: 'Page Title', type: 'text' },
          { name: 'desc', label: 'Page Description', type: 'textarea' },
        ],
      },
      {
        id: 'items',
        title: 'Portfolio Items',
        fields: [
          { name: 'item1Title', label: 'Item 1 Title', type: 'text' },
          { name: 'item1Desc', label: 'Item 1 Description', type: 'text' },
          { name: 'item1Image', label: 'Item 1 Image', type: 'image' },
          
          { name: 'item2Title', label: 'Item 2 Title', type: 'text' },
          { name: 'item2Desc', label: 'Item 2 Description', type: 'text' },
          { name: 'item2Image', label: 'Item 2 Image', type: 'image' },
          
          { name: 'item3Title', label: 'Item 3 Title', type: 'text' },
          { name: 'item3Desc', label: 'Item 3 Description', type: 'text' },
          { name: 'item3Image', label: 'Item 3 Image', type: 'image' },
          
          { name: 'item4Title', label: 'Item 4 Title', type: 'text' },
          { name: 'item4Desc', label: 'Item 4 Description', type: 'text' },
          { name: 'item4Image', label: 'Item 4 Image', type: 'image' },
          
          { name: 'item5Title', label: 'Item 5 Title', type: 'text' },
          { name: 'item5Desc', label: 'Item 5 Description', type: 'text' },
          { name: 'item5Image', label: 'Item 5 Image', type: 'image' },
        ],
      }
    ]
  },
  services: {
    id: 'services',
    title: 'Services Page',
    sections: [
      {
        id: 'header',
        title: 'Header Section',
        fields: [
          { name: 'title', label: 'Page Title', type: 'text' },
          { name: 'desc', label: 'Page Description', type: 'textarea' },
        ],
      },
      {
        id: 'tier1',
        title: 'Tier 1 (Standard)',
        fields: [
          { name: 'tier1Title', label: 'Package Name', type: 'text' },
          { name: 'tier1Price', label: 'Price', type: 'text' },
          { name: 'tier1Desc', label: 'Description', type: 'textarea' },
          { name: 'tier1Feature1', label: 'Feature 1', type: 'text' },
          { name: 'tier1Feature2', label: 'Feature 2', type: 'text' },
          { name: 'tier1Feature3', label: 'Feature 3', type: 'text' },
          { name: 'tier1Feature4', label: 'Feature 4', type: 'text' },
          { name: 'tier1Feature5', label: 'Feature 5', type: 'text' },
        ],
      },
      {
        id: 'tier2',
        title: 'Tier 2 (Signature)',
        fields: [
          { name: 'tier2Title', label: 'Package Name', type: 'text' },
          { name: 'tier2Price', label: 'Price', type: 'text' },
          { name: 'tier2Desc', label: 'Description', type: 'textarea' },
          { name: 'tier2Feature1', label: 'Feature 1', type: 'text' },
          { name: 'tier2Feature2', label: 'Feature 2', type: 'text' },
          { name: 'tier2Feature3', label: 'Feature 3', type: 'text' },
          { name: 'tier2Feature4', label: 'Feature 4', type: 'text' },
          { name: 'tier2Feature5', label: 'Feature 5', type: 'text' },
        ],
      },
      {
        id: 'tier3',
        title: 'Tier 3 (Editorial)',
        fields: [
          { name: 'tier3Title', label: 'Package Name', type: 'text' },
          { name: 'tier3Price', label: 'Price', type: 'text' },
          { name: 'tier3Desc', label: 'Description', type: 'textarea' },
          { name: 'tier3Feature1', label: 'Feature 1', type: 'text' },
          { name: 'tier3Feature2', label: 'Feature 2', type: 'text' },
          { name: 'tier3Feature3', label: 'Feature 3', type: 'text' },
          { name: 'tier3Feature4', label: 'Feature 4', type: 'text' },
          { name: 'tier3Feature5', label: 'Feature 5', type: 'text' },
        ],
      },
      {
        id: 'faq',
        title: 'FAQ',
        fields: [
          { name: 'inquireBtn', label: 'Inquire Button Text', type: 'text' },
          { name: 'faqTitle', label: 'FAQ Title', type: 'text' },
          { name: 'faq1Q', label: 'Question 1', type: 'text' },
          { name: 'faq1A', label: 'Answer 1', type: 'textarea' },
          { name: 'faq2Q', label: 'Question 2', type: 'text' },
          { name: 'faq2A', label: 'Answer 2', type: 'textarea' },
          { name: 'faq3Q', label: 'Question 3', type: 'text' },
          { name: 'faq3A', label: 'Answer 3', type: 'textarea' },
        ]
      }
    ]
  },
  contact: {
    id: 'contact',
    title: 'Contact Page',
    sections: [
      {
        id: 'header',
        title: 'Header Section',
        fields: [
          { name: 'title', label: 'Page Title', type: 'text' },
          { name: 'desc', label: 'Page Description', type: 'textarea' },
        ],
      },
      {
        id: 'form',
        title: 'Form Labels',
        fields: [
          { name: 'firstName', label: 'First Name', type: 'text' },
          { name: 'lastName', label: 'Last Name', type: 'text' },
          { name: 'email', label: 'Email Address', type: 'text' },
          { name: 'eventType', label: 'Event Type', type: 'text' },
          { name: 'date', label: 'Event Date', type: 'text' },
          { name: 'details', label: 'Details Placeholder', type: 'text' },
          { name: 'submitBtn', label: 'Submit Button Text', type: 'text' },
        ],
      },
      {
        id: 'studioInfo',
        title: 'Studio Information',
        fields: [
          { name: 'studioTitle', label: 'Studio Title', type: 'text' },
          { name: 'studioDesc', label: 'Studio Description', type: 'text' },
          { name: 'address1', label: 'Address Line 1', type: 'text' },
          { name: 'address2', label: 'Address Line 2', type: 'text' },
          { name: 'address3', label: 'Address Line 3', type: 'text' },
          { name: 'phone', label: 'Phone Number', type: 'text' },
          { name: 'contactEmail', label: 'Contact Email', type: 'text' },
        ],
      }
    ]
  }
};
