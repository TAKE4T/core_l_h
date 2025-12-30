// Domain model types (SSOT-derived)

export type Visibility = "PUBLIC" | "MEMBERS_ONLY";
export type ArticleStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type TagScope = "GLOBAL" | "OWNER";
export type TagStatus = "ACTIVE" | "MERGED" | "DEPRECATED";

export type Id = string;

export interface Owner {
  id: Id;
  userSlug: string; // globally unique
  displayName: string;
  createdAt: string;
  updatedAt: string;
}

export interface CoreLanguageArtifact {
  id: Id;
  ownerId: Id;

  content: string; // CLA text
  version: number;

  createdAt: string;
  updatedAt: string;
}

export interface ContentPlanBatch {
  id: Id;
  ownerId: Id;
  claId: Id;

  createdAt: string;
  updatedAt: string;
}

export type TitleIdeaStatus = "PROPOSED" | "SELECTED" | "REJECTED";

export interface TitleIdea {
  id: Id;
  ownerId: Id;
  batchId: Id;

  title: string;
  status: TitleIdeaStatus;

  createdAt: string;
  updatedAt: string;
}

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

  // Outline is saved; format is implementation detail (markdown/text).
  outline?: string;

  tagIds: Id[];

  readCompleteCount: number;

  edition: number;

  createdAt: string;
  updatedAt: string;
  publishedAt?: string;

  // Optional links to upstream generation artifacts.
  claId?: Id;
  contentPlanBatchId?: Id;
  titleIdeaId?: Id;
}
