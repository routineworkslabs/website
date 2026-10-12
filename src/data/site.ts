import company from '../../site.config.json';

export const site = {
  ...company,
  url: `https://${company.domain}`,
  emailHref: `mailto:${company.email}`,
};
