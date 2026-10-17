import { existsSync } from 'node:fs';

export const site = {
  name: 'Deen Al Eusuf',
  title: 'Deen Al Eusuf · Software engineer',
  description:
    'Software engineer in Singapore building AI products that hold up in production. Graduating from DigiPen and SIT in 2027.',
  email: '1817aldeen@gmail.com',
  linkedin: 'https://www.linkedin.com/in/deenaleusuf',
  github: 'https://github.com/Deen11',
  // The resume link only appears once public/resume.pdf exists.
  resume: existsSync(new URL('../public/resume.pdf', import.meta.url)) ? '/resume.pdf' : null,
};
