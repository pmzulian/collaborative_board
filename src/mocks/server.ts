import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Node.js MSW server — used by Vitest (not in the browser).
export const server = setupServer(...handlers);
