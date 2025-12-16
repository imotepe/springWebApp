export type Organization = {
  id?: string;
  name: string;
  marketingName?: string;
  industry?: string;
  type: string;
  phone?: string;
  mapsLink?: string;
  facebookPage?: string;
  facebookGroup?: string;
  instagram?: string;
  whatsappContact?: string;
  logoImage?: string;
};

export type OrganizationType = {
  id: string;
  name: string;
  description?: string;
};
