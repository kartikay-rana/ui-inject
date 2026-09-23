export type AccessLevel = 'free' | 'premium';
export type ComponentStatus = 'draft' | 'published';

export interface ComponentBundle {
  /** unique slug, lowercase kebab */
  slug: string;
  name: string;
  description: string;
  category: string;
  version: string;
  accessLevel: AccessLevel;
  /** declared runtime dependencies (allowlisted) */
  dependencies: string[];
  /** concisely documented props (TS interface + notes) */
  props: string;
  /** markdown usage documentation */
  usage: string;
  /** relative-path -> source file contents */
  files: Record<string, string>;
  /** which file/export drives the live preview + its sample props */
  preview: { story: string; sample: Record<string, unknown> } | null;
}

export interface ComponentRecord extends ComponentBundle {
  id: string;
  status: ComponentStatus;
  createdAt: string;
  updatedAt: string;
  /** public thumbnail path (asset or generated svg endpoint) */
  thumbnail?: string;
  publishedAt: string | null;
  /** content hash — proves preview/copy/install/prompt all reference one version */
  contentHash: string;
}

/** Public list item — never contains source files. */
export interface PublicComponentView {
  slug: string;
  name: string;
  description: string;
  category: string;
  version: string;
  accessLevel: AccessLevel;
  status: ComponentStatus;
  thumbnail?: string;
  publishedAt: string | null;
}

export interface Customer {
  id: string;
  email: string;
  name: string;
  isPremium: boolean;
  createdAt: string;
}

export interface InstallFile {
  /** safe relative path inside the consumer directory */
  path: string;
  content: string;
}

export interface InstallManifest {
  slug: string;
  name: string;
  version: string;
  accessLevel: AccessLevel;
  dependencies: string[];
  themeFiles: InstallFile[];
  files: InstallFile[];
  /** where preview stories live; consumers install everything but may ignore stories */
  readme?: string;
}

export interface AgentPromptResult {
  prompt: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  isPremium: boolean;
  role: 'customer';
}

export interface AdminInfo {
  username: string;
  role: 'admin';
}

export type SessionPrincipal = AuthUser | AdminInfo;