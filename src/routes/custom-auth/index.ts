import { auth } from '@/lib/auth';
import { createApp, type AppBindings } from '@/lib/create-app';
import { createMiddleware } from 'hono/factory';
import { z } from 'zod';

type Role = 'admin' | 'user';

const memberSchema = z.object({
  organizationId: z.string().min(1).optional(),
  userId: z.string().min(1),
  role: z.enum(['admin', 'member']),
  teamId: z.string().optional(),
});

const authorize = (roles: Role[]) => createMiddleware<AppBindings>(async (c, next) => {
  const user = c.get('user');

  if (!user?.role || !roles.includes(user.role as Role)) {
    return c.text('Forbidden', 403);
  }

  return next();
});

export const customRouter = createApp();

customRouter.use('/organization/add-member', authorize(['admin']));

customRouter.post('/organization/add-member', async (c) => {
  const parse = memberSchema.safeParse(await c.req.json());
  if (!parse.success) {
    return c.json({ error: 'Invalid input', details: parse.error.flatten() }, 400);
  }

  try {
    const res = await auth.api.addMember({ headers: c.req.header(), body: parse.data });

    return c.json(res, 201);
  } catch (error: any) {
    const message = error.body.message || 'something went wrong';

    return c.json({ error: message }, error.statusCode || 500);
  }
});
