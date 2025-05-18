import { auth } from '@/lib/auth';
import { createApp, type AppBindings } from '@/lib/create-app';
import { updateMembership } from '@/services/membership.service';
import { createMiddleware } from 'hono/factory';
import { createLocalJWKSet, jwtVerify } from 'jose';
import { z } from 'zod';

let jwks: ReturnType<typeof createLocalJWKSet>;

type Role = 'admin' | 'user';

const memberSchema = z.object({
  organizationId: z.string().min(1).optional(),
  userId: z.string().min(1),
  role: z.enum(['admin', 'member']),
  teamId: z.string().optional(),
});

const authorizeGuard = (roles: Role[]) => createMiddleware<AppBindings>(async (c, next) => {
  // verify by session
  const user = c.get('user');
  if (user && roles.includes(user.role as Role)) {
    return next();
  }

  // verify by jwt in Authorization: Bearer
  if (!jwks) {
    const keys = await auth.api.getJwks();
    jwks = createLocalJWKSet(keys);
  }

  const authorizationHeader = c.req.header('Authorization');
  const token = authorizationHeader?.split(' ')?.[1];

  if (!token) {
    return c.text('Unauthorized', 401);
  }

  try {
    const { payload } = await jwtVerify(token, jwks);

    if (!payload.role || !roles.includes(payload.role as Role)) {
      return c.text('Forbidden', 403);
    }

    return next();
  } catch (error: any) {
    if (error.message === '"exp" claim timestamp check failed') {
      return c.json('Unauthorized', 401);
    }

    return c.json({ message: error.message || 'something went wrong' }, 500);
  }
});

export const customRouter = createApp();

customRouter.use('/organization/add-member', authorizeGuard(['admin']));

customRouter.post('/organization/add-member', async (c) => {
  const parse = memberSchema.safeParse(await c.req.json());
  if (!parse.success) {
    return c.json({ error: 'Invalid input', details: parse.error.flatten() }, 400);
  }

  try {
    const res = await auth.api.addMember({ headers: c.req.header(), body: parse.data });

    if (parse.data.teamId && res?.id) {
      // TODO: check better-auth updates if this issue is fixed
      // by better-auth@1.2.8 provided teamId is not stored when add through api.addMember
      const [member] = await updateMembership(res.id, { teamId: parse.data.teamId });
      return c.json(member, 201);
    }

    return c.json(res, 201);
  } catch (error: any) {
    const message = error.body.message || 'something went wrong';

    return c.json({ error: message }, error.statusCode || 500);
  }
});
