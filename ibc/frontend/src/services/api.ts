const API_BASE_URL = "http://localhost:8000/api/v1";

export interface Version {
  id: string;
  version_code: string;
  release_date: string;
  is_base: boolean;
}

export interface Node {
  id: string;
  node_type: string;
  label: string;
  identifier: string;
  sort_order: number;
  children?: Node[];
  context?: string;
}

export interface NodeContent {
  id: string;
  raw_content: string;
  version: Version;
}

export interface SectionDetail {
  node: Node;
  versions: Version[];
  current_content: NodeContent | null;
}

export const api = {
  getSources: async () => {
    const res = await fetch(`${API_BASE_URL}/laws/`);
    if (!res.ok) throw new Error("Failed to fetch sources");
    return res.json();
  },
  
  getHierarchy: async (sourceCode: string): Promise<Node[]> => {
    const res = await fetch(`${API_BASE_URL}/hierarchy/${sourceCode}`);
    if (!res.ok) throw new Error("Failed to fetch hierarchy");
    return res.json();
  },
  
  getSectionDetail: async (sourceCode: string, identifier: string, version_code?: string, node_type: string = "section"): Promise<SectionDetail> => {
    const url = new URL(`${API_BASE_URL}/content/${sourceCode}/${identifier}`);
    url.searchParams.append("node_type", node_type);
    if (version_code) {
      url.searchParams.append("version_code", version_code);
    }
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error("Content not found for this version");
    return res.json();
  },
  
  getVersions: async (sourceCode: string): Promise<Version[]> => {
    const res = await fetch(`${API_BASE_URL}/content/versions/${sourceCode}`);
    if (!res.ok) throw new Error("Failed to fetch versions");
    return res.json();
  },

  async search(query: string, sourceCode: string = "ibc"): Promise<Node[]> {
    const response = await fetch(`${API_BASE_URL}/search/?q=${encodeURIComponent(query)}&source_code=${sourceCode}`);
    if (!response.ok) throw new Error("Search failed");
    return response.json();
  }
};
