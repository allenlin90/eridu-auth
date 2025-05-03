import { z } from "zod";
import { createSelectSchema } from "drizzle-zod";

import { member, organization, team } from "@/db/schema";

export const membershipSchema = createSelectSchema(member).extend({
  team: createSelectSchema(team),
  organization: createSelectSchema(organization),
});

export type MembershipSchema = z.infer<typeof membershipSchema>;

const membershipTransformer = membershipSchema.transform((data) => ({
  id: data.id,
  role: data.role,
  user_id: data.userId,
  team: data.team ? {
    id: data.teamId,
    name: data.team.name,
  } : null,
  organization: {
    id: data.organizationId,
    logo: data.organization.logo,
    metadata: data.organization.metadata,
    name: data.organization.name,
    slug: data.organization.slug,
  },
}));

export const jwtMembershipSerializer = (membership: MembershipSchema) => {
  return membershipTransformer.parse(membership);
};