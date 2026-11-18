// Vercel serverless entry: all /api/* traffic is rewritten here
// (see vercel.json) and handled by the Express app exported from server.ts.
export { default } from '../server';
