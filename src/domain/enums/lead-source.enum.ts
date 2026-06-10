export enum LeadSource {
  INSTAGRAM = 'INSTAGRAM',
  LINKEDIN = 'LINKEDIN',
  GOOGLE_MAPS = 'GOOGLE_MAPS',
  AMAZON = 'AMAZON',
  FLIPKART = 'FLIPKART',
  REFERRAL = 'REFERRAL',
  WEBSITE_FORM = 'WEBSITE_FORM',
  MANUAL_RESEARCH = 'MANUAL_RESEARCH',
  OTHER = 'OTHER',
}

export const LeadSourceLabels: Record<LeadSource, string> = {
  [LeadSource.INSTAGRAM]: 'Instagram',
  [LeadSource.LINKEDIN]: 'LinkedIn',
  [LeadSource.GOOGLE_MAPS]: 'Google Maps',
  [LeadSource.AMAZON]: 'Amazon',
  [LeadSource.FLIPKART]: 'Flipkart',
  [LeadSource.REFERRAL]: 'Referral',
  [LeadSource.WEBSITE_FORM]: 'Website Form',
  [LeadSource.MANUAL_RESEARCH]: 'Manual Research',
  [LeadSource.OTHER]: 'Other',
};
