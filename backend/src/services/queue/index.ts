import { generateUserHeadshots } from './headshot.queue';
import { addUserCredits } from './payment.queue';

export * from './headshot.queue';
export * from './payment.queue';
export * from './queue.service';

export const inngestFunctions = [
  addUserCredits(),
  generateUserHeadshots(),
];

