export type Organization = {
  id?: string;
  name: string;
  marketingName?: string;
  industry?: string;
  type: string;
  phone?: string;
  databaseName?: string;
};

export type OrganizationType = {
  id: string;
  name: string;
  description?: string;
};
