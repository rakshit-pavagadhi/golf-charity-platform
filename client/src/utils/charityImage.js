const fallbackImage = '/charity-community.svg';

export function getCharityImage(charity) {
  if (!charity?.image || charity.name === 'Community Links Trust') return fallbackImage;
  return charity.image;
}
