import { Hono } from 'hono';
import { auth } from './lib/auth'; // path to your auth file
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import env from '@/env';

const app = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>();

app.use('*', cors());

app.use('*', async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  c.set('user', session?.user ?? null);
  c.set('session', session?.session ?? null);
  return next();
});

app.on(['POST', 'GET'], '/api/auth/**', (c) => auth.handler(c.req.raw));

serve(
  {
    fetch: app.fetch,
    port: env.PORT,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);

// TODO: graceful shutdown
