interface SearchResult {
  url: string;
  title: string;
}

interface ExtractedContent {
  url: string;
  title: string | null;
  content: string;
}

interface SearchService {
  search(
    query: string,
    options?: { country?: string }
  ): Promise<{ results: SearchResult[] }>;
  extractContent(urls: string[]): Promise<{ results: ExtractedContent[] }>;
}

export type { SearchResult, ExtractedContent, SearchService };
