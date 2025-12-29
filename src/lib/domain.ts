// Domain model types (SSOT-derived)

export type Visibility = "PUBLIC" | "MEMBERS_ONLY";
export type ArticleStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type TagScope = "GLOBAL" | "OWNER";
export type TagStatus = "ACTIVE" | "MERGED" | "DEPRECATED";

export type Id = string;

export interface Tag {
  id: Id;
  scope: TagScope;
  ownerId?: Id; // required when scope === 'OWNER'
  label: string;
  slug: string;
  status: TagStatus;
  canonicalTagId?: Id;
  createdAt: string;
  updatedAt: string;
}

export interface ReaderProfile {
  id: Id;
  ownerId: Id;

  presetTagIds: Id[];
  freeTextInterests: string[];

  // Only interests that were suggested and then accepted.
  normalizedTagIdsFromFreeText: Id[];

  createdAt: string;
  updatedAt: string;
}

export interface Article {
  id: Id;
  ownerId: Id;

  title: string;
  slug: string; // unique within owner

  status: ArticleStatus;
  visibility: Visibility;

  // TipTap JSON serialized as string
  content: string;
  excerpt: string;

  tagIds: Id[];

  readCompleteCount: number;

  edition: number;

  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}
