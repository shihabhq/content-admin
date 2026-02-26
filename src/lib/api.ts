const API_BASE = process.env.NEXT_PUBLIC_CONTENT_API_URL || "";

export type ApiError = { error: Record<string, unknown>; message?: string };

async function request<T>(
  path: string,
  options: RequestInit & { token?: string } = {}
): Promise<{ data?: T; error?: ApiError }> {
  const { token, ...init } = options;
  const url = `${API_BASE}${path}`;
  const headers: HeadersInit = {
    ...(init.headers as Record<string, string>),
  };
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }
  if (!(init.body instanceof FormData)) {
    (headers as Record<string, string>)["Content-Type"] = "application/json";
  }

  const res = await fetch(url, { ...init, headers });
  const text = await res.text();
  let json: T | ApiError | null = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    return { error: { error: { message: text || res.statusText } } };
  }

  if (!res.ok) {
    return {
      error: (json as ApiError) || { error: { message: res.statusText } },
    };
  }
  return { data: json as T };
}

// ——— Tags ———
export interface Tag {
  id: string;
  name: string;
  slug: string;
  _count?: { videos: number; artworks: number };
}

export async function fetchTags(token: string): Promise<{ data?: Tag[]; error?: ApiError }> {
  return request<Tag[]>("/api/admin/tags", { token });
}

export async function createTag(
  token: string,
  body: { name: string }
): Promise<{ data?: Tag; error?: ApiError }> {
  return request<Tag>("/api/admin/tags", {
    method: "POST",
    body: JSON.stringify(body),
    token,
  });
}

export async function updateTag(
  token: string,
  id: string,
  body: { name: string }
): Promise<{ data?: Tag; error?: ApiError }> {
  return request<Tag>(`/api/admin/tags/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
    token,
  });
}

export async function deleteTag(
  token: string,
  id: string
): Promise<{ data?: { success: boolean }; error?: ApiError }> {
  return request<{ success: boolean }>(`/api/admin/tags/${id}`, {
    method: "DELETE",
    token,
  });
}

/** Resolve comma-separated tag names to tag IDs; creates tags that don't exist. */
export async function resolveTagNamesToIds(
  token: string,
  names: string[]
): Promise<{ data?: string[]; error?: ApiError }> {
  const trimmed = names.map((n) => n.trim()).filter(Boolean);
  if (trimmed.length === 0) return { data: [] };

  const { data: existingTags, error: fetchErr } = await fetchTags(token);
  if (fetchErr) return { error: fetchErr };
  const tags = existingTags ?? [];
  const byName = new Map(tags.map((t) => [t.name.toLowerCase(), t]));
  const ids: string[] = [];

  for (const name of trimmed) {
    let tag = byName.get(name.toLowerCase());
    if (!tag) {
      const { data: created, error: createErr } = await createTag(token, { name });
      if (createErr) return { error: createErr };
      if (!created) return { error: { error: { message: "Failed to create tag" } } };
      tag = created;
      byName.set(name.toLowerCase(), tag);
    }
    ids.push(tag.id);
  }
  return { data: ids };
}

// ——— Videos ———
export interface VideoTagRelation {
  tagId: string;
  tag: Tag;
}

export interface Video {
  id: string;
  title: string;
  slug: string;
  youtubeUrl: string;
  youtubeId: string;
  description: string | null;
  thumbnail: string | null;
  isFeatured: boolean;
  isRecommended: boolean;
  createdAt: string;
  updatedAt: string;
  tags: VideoTagRelation[];
}

export interface VideosResponse {
  data: Video[];
  total: number;
  page: number;
  pageSize: number;
}

export async function fetchVideos(
  token: string,
  page = 1,
  pageSize = 20
): Promise<{ data?: VideosResponse; error?: ApiError }> {
  return request<VideosResponse>(
    `/api/admin/videos?page=${page}&pageSize=${pageSize}`,
    { token }
  );
}

export async function fetchVideo(
  token: string,
  id: string
): Promise<{ data?: Video; error?: ApiError }> {
  return request<Video>(`/api/admin/videos/${id}`, { token });
}

export async function createVideo(
  token: string,
  body: {
    title: string;
    youtubeUrl: string;
    description?: string;
    thumbnail?: string;
    isFeatured?: boolean;
    isRecommended?: boolean;
    tagIds?: string[];
  }
): Promise<{ data?: Video; error?: ApiError }> {
  return request<Video>("/api/admin/videos", {
    method: "POST",
    body: JSON.stringify(body),
    token,
  });
}

export async function updateVideo(
  token: string,
  id: string,
  body: Partial<{
    title: string;
    youtubeUrl: string;
    description: string;
    thumbnail: string;
    isFeatured: boolean;
    isRecommended: boolean;
    tagIds: string[];
  }>
): Promise<{ data?: Video; error?: ApiError }> {
  return request<Video>(`/api/admin/videos/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
    token,
  });
}

export async function deleteVideo(
  token: string,
  id: string
): Promise<{ data?: { success: boolean }; error?: ApiError }> {
  return request<{ success: boolean }>(`/api/admin/videos/${id}`, {
    method: "DELETE",
    token,
  });
}

// ——— Artworks ———
export interface ArtworkTagRelation {
  tagId: string;
  tag: Tag;
}

export interface Artwork {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  imageUrl: string;
  isFeatured: boolean;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  tags: ArtworkTagRelation[];
}

export interface ArtworksResponse {
  data: Artwork[];
  total: number;
  page: number;
  pageSize: number;
}

export async function fetchArtworks(
  token: string,
  page = 1,
  pageSize = 20
): Promise<{ data?: ArtworksResponse; error?: ApiError }> {
  return request<ArtworksResponse>(
    `/api/admin/artworks?page=${page}&pageSize=${pageSize}`,
    { token }
  );
}

export async function fetchArtwork(
  token: string,
  id: string
): Promise<{ data?: Artwork; error?: ApiError }> {
  return request<Artwork>(`/api/admin/artworks/${id}`, { token });
}

export async function createArtwork(
  token: string,
  form: {
    title: string;
    content?: string;
    isFeatured?: boolean;
    isPublished?: boolean;
    tagIds?: string[];
    image: File;
  }
): Promise<{ data?: Artwork; error?: ApiError }> {
  const formData = new FormData();
  formData.append("title", form.title);
  if (form.content != null) formData.append("content", form.content);
  formData.append("isFeatured", String(!!form.isFeatured));
  formData.append("isPublished", String(form.isPublished !== false));
  formData.append("tagIds", JSON.stringify(form.tagIds || []));
  formData.append("image", form.image);

  return request<Artwork>("/api/admin/artworks", {
    method: "POST",
    body: formData,
    token,
  });
}

export async function updateArtwork(
  token: string,
  id: string,
  form: {
    title?: string;
    content?: string;
    isFeatured?: boolean;
    isPublished?: boolean;
    tagIds?: string[];
    image?: File;
  }
): Promise<{ data?: Artwork; error?: ApiError }> {
  const formData = new FormData();
  if (form.title != null) formData.append("title", form.title);
  if (form.content !== undefined) formData.append("content", form.content);
  if (form.isFeatured !== undefined)
    formData.append("isFeatured", String(form.isFeatured));
  if (form.isPublished !== undefined)
    formData.append("isPublished", String(form.isPublished));
  if (form.tagIds !== undefined)
    formData.append("tagIds", JSON.stringify(form.tagIds));
  if (form.image) formData.append("image", form.image);

  return request<Artwork>(`/api/admin/artworks/${id}`, {
    method: "PUT",
    body: formData,
    token,
  });
}

export async function deleteArtwork(
  token: string,
  id: string
): Promise<{ data?: { success: boolean }; error?: ApiError }> {
  return request<{ success: boolean }>(`/api/admin/artworks/${id}`, {
    method: "DELETE",
    token,
  });
}
