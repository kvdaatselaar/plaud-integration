const GRAPH_BASE = 'https://graph.microsoft.com/v1.0';

interface GraphError {
  error?: { code?: string; message?: string };
}

async function graphRequest<T>(
  token: string,
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${GRAPH_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      ...(init.headers ?? {}),
    },
  });
  if (!res.ok) {
    let body: GraphError | string;
    try {
      body = await res.json() as GraphError;
    } catch {
      body = await res.text();
    }
    const msg = typeof body === 'string'
      ? body
      : body?.error?.message ?? JSON.stringify(body);
    throw new Error(`Graph ${res.status} ${res.statusText}: ${msg}`);
  }
  if (res.status === 204) return undefined as T;
  const ct = res.headers.get('content-type') ?? '';
  if (ct.includes('application/json')) return res.json() as Promise<T>;
  return undefined as T;
}

interface OneNoteLink { href: string; }
interface OneNoteLinks { oneNoteClientUrl?: OneNoteLink; oneNoteWebUrl?: OneNoteLink }
interface OneNoteNotebook { id: string; displayName: string; links?: OneNoteLinks; }
interface OneNoteSection { id: string; displayName: string; }
export interface OneNotePage { id: string; title: string; links?: OneNoteLinks; }

export class OneNote {
  constructor(private token: string) {}

  async getNotebook(id: string): Promise<OneNoteNotebook> {
    return graphRequest<OneNoteNotebook>(this.token, `/me/onenote/notebooks/${id}`);
  }

  async findNotebook(name: string): Promise<OneNoteNotebook | null> {
    const data = await graphRequest<{ value: OneNoteNotebook[] }>(
      this.token,
      `/me/onenote/notebooks?$filter=displayName eq '${encodeURIComponent(name).replace(/'/g, "''")}'`,
    );
    return data.value[0] ?? null;
  }

  async createNotebook(name: string): Promise<OneNoteNotebook> {
    return graphRequest<OneNoteNotebook>(this.token, '/me/onenote/notebooks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ displayName: name }),
    });
  }

  async findSection(notebookId: string, name: string): Promise<OneNoteSection | null> {
    const data = await graphRequest<{ value: OneNoteSection[] }>(
      this.token,
      `/me/onenote/notebooks/${notebookId}/sections?$filter=displayName eq '${encodeURIComponent(name).replace(/'/g, "''")}'`,
    );
    return data.value[0] ?? null;
  }

  async createSection(notebookId: string, name: string): Promise<OneNoteSection> {
    return graphRequest<OneNoteSection>(
      this.token,
      `/me/onenote/notebooks/${notebookId}/sections`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: name }),
      },
    );
  }

  async ensureNotebookSection(notebookName: string, sectionName: string): Promise<{ notebookId: string; sectionId: string }> {
    const notebook = (await this.findNotebook(notebookName)) ?? (await this.createNotebook(notebookName));
    const section = (await this.findSection(notebook.id, sectionName)) ?? (await this.createSection(notebook.id, sectionName));
    return { notebookId: notebook.id, sectionId: section.id };
  }

  async createPage(sectionId: string, html: string): Promise<OneNotePage> {
    return graphRequest<OneNotePage>(
      this.token,
      `/me/onenote/sections/${sectionId}/pages`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/xhtml+xml' },
        body: html,
      },
    );
  }

  async replacePageBody(pageId: string, html: string): Promise<void> {
    await graphRequest<void>(
      this.token,
      `/me/onenote/pages/${pageId}/content`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([
          { target: 'body', action: 'replace', content: html },
        ]),
      },
    );
  }

  async replacePageTitle(pageId: string, title: string): Promise<void> {
    await graphRequest<void>(
      this.token,
      `/me/onenote/pages/${pageId}/content`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([
          { target: 'title', action: 'replace', content: title },
        ]),
      },
    );
  }
}
