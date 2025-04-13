import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { adminClient } from 'better-auth/client/plugins';
import {
  admin,
  bearer,
  jwt,
  magicLink,
  organization,
  openAPI,
} from 'better-auth/plugins';

import { db } from '@/db';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  account: {
    accountLinking: {
      enabled: true,
      allowDifferentEmails: true,
    },
  },
  advanced: {
    crossSubDomainCookies: {
      enabled: true,
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async (data, _request) => {
      // TODO: send reset password email
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async (data, _request) => {
      // TODO: send verification email to suer after signup
    },
  },
  user: {
    changeEmail: {
      enabled: true,
      requireEmailVerification: true,
      sendChangeEmailVerification: async (data, _request) => {
        // TODO: verification email must be sent to the current user email to approve the change
        // if the current email isn't verified, the change happens immediately without verification
      },
    },
  },
  plugins: [
    admin(),
    adminClient(),
    bearer(),
    jwt(),
    magicLink({
      sendMagicLink: async (data, _request) => {
        // TODO: enable to send magic link
      },
    }),
    organization({
      allowUserToCreateOrganization: (_user) => {
        // TODO: check if user can create an organization
        return true;
      },
      sendInvitationEmail: async (_data) => {
        // TODO: send invitation email
      },
    }),
    openAPI(),
  ],
});
