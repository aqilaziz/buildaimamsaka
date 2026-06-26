// ============================================
// MAMSAKA: TypeScript Types
// ============================================

export type UserRole = "student" | "mentor" | "admin";
export type ProjectStatus = "draft" | "published" | "archived";
export type MediaType = "image" | "video" | "pdf";
export type ActivityAction = "view" | "like" | "star" | "comment" | "publish";

// ── Profile ──
export interface Profile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  bio: string;
  website: string;
  github_username: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

// ── Project ──
export interface Project {
  id: string;
  owner_id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail_url: string;
  demo_video_url: string;
  github_url: string;
  live_url: string;
  status: ProjectStatus;
  stars_count: number;
  likes_count: number;
  views_count: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

// Extended project with owner profile joined
export interface ProjectWithOwner extends Project {
  owner: Profile;
}

// Extended project with interaction state
export interface ProjectWithInteractions extends ProjectWithOwner {
  has_starred?: boolean;
  has_liked?: boolean;
  tags?: Tag[];
  media?: ProjectMedia[];
}

// ── Star / Like ──
export interface Star {
  id: string;
  project_id: string;
  user_id: string;
  created_at: string;
}

export interface Like {
  id: string;
  project_id: string;
  user_id: string;
  created_at: string;
}

// ── Comment ──
export interface Comment {
  id: string;
  project_id: string;
  user_id: string;
  content: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CommentWithAuthor extends Comment {
  author: Profile;
  replies?: CommentWithAuthor[];
}

// ── Tag ──
export interface Tag {
  id: string;
  name: string;
  slug: string;
  usage_count: number;
}

// ── Project Media ──
export interface ProjectMedia {
  id: string;
  project_id: string;
  media_url: string;
  media_type: MediaType;
  sort_order: number;
  created_at: string;
}

// ── Form Inputs ──
export interface ProjectFormData {
  title: string;
  description: string;
  thumbnail_url: string;
  demo_video_url: string;
  github_url: string;
  live_url: string;
  tags: string[];
  status: ProjectStatus;
}

export interface ProfileFormData {
  username: string;
  full_name: string;
  bio: string;
  website: string;
  github_username: string;
}

// ── Pagination ──
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  count: number;
  page: number;
  totalPages: number;
}
