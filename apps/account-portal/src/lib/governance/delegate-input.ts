import { z } from "zod";

export const DELEGATE_INTERESTS = [
  { value: "gaming", label: "Gaming" },
  { value: "game-design", label: "Game Design" },
  { value: "game-development", label: "Game Development" },
  { value: "dao", label: "DAO" },
  { value: "defi", label: "DeFi" },
  { value: "autonomous-worlds", label: "Autonomous Worlds" },
  { value: "cybersecurity", label: "Cybersecurity" },
  { value: "esports", label: "Esports" },
  { value: "encryption", label: "Encryption" },
  { value: "ai-in-gaming", label: "AI in Gaming" },
  { value: "nfts", label: "NFTs" },
  { value: "economics", label: "Economics" },
  { value: "cryptography", label: "Cryptography" },
  { value: "scaling", label: "Scaling" },
  { value: "starknet", label: "Starknet" },
  { value: "governance", label: "Governance" },
  { value: "finance", label: "Finance" },
] as const;

const interestValues = DELEGATE_INTERESTS.map(({ value }) => value) as [
  string,
  ...string[],
];
const optionalHandle = z.string().trim().max(100).optional();

export const DelegateQuerySchema = z.object({
  limit: z.number().int().min(1).max(200).default(100),
  orderBy: z.enum(["desc", "random"]).default("random"),
  search: z
    .string()
    .trim()
    .max(66)
    .regex(/^(?:0x)?[0-9a-fA-F]{0,64}$/)
    .default(""),
});

export const DelegateProfileInputSchema = z.object({
  statement: z.string().trim().min(1, "Statement is required").max(2_000),
  interests: z.array(z.enum(interestValues)).max(17).optional(),
  twitter: optionalHandle,
  github: optionalHandle,
  telegram: optionalHandle,
  discord: optionalHandle,
});

export type DelegateProfileInput = z.infer<typeof DelegateProfileInputSchema>;
export type DelegateQuery = z.infer<typeof DelegateQuerySchema>;
