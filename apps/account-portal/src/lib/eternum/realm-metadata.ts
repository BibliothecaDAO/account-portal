import { z } from "zod";

const MetadataAttributeSchema = z.object({
  display_type: z.string().max(100).optional(),
  trait_type: z.string().max(100).optional(),
  value: z.union([z.string().max(256), z.number().finite()]).optional(),
});

const RealmMetadataSchema = z.object({
  name: z.string().max(256).optional(),
  description: z.string().max(10_000).optional(),
  image: z.string().max(2_048).optional(),
  attributes: z.array(MetadataAttributeSchema).max(256).optional(),
});

export type RealmMetadata = z.infer<typeof RealmMetadataSchema>;

export function parseRealmMetadata(
  metadata: string | null | undefined,
): RealmMetadata | null {
  if (!metadata) return null;

  try {
    const parsed = JSON.parse(metadata) as unknown;
    const result = RealmMetadataSchema.safeParse(parsed);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}
