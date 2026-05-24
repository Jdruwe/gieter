import { z } from "zod";
import type {
  SearchService,
  SearchResult,
  ExtractedContent,
} from "./search.service";

const tavilySearchResultSchema = z.object({
  title: z.string(),
  url: z.url(),
});

const tavilySearchResponseSchema = z.object({
  results: z.array(tavilySearchResultSchema),
});

const tavilyExtractedContentSchema = z.object({
  title: z.string().nullable(),
  url: z.url(),
  raw_content: z.string(),
});

const tavilyExtractResponseSchema = z.object({
  results: z.array(tavilyExtractedContentSchema),
});

const tavilyErrorSchema = z.object({
  detail: z.object({
    error: z.string(),
  }),
});

// todo: why expose 2 methods, wouldn't it be easier to use -> reduce complexity if the service only exposed 1? 2 methods do allow the workflow to retry an a specific part but should that reflect here?

export class TavilySearchService implements SearchService {
  constructor(private apiKey: string) {}

  async search(query: string, options?: { country?: string }) {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, ...options }),
    });

    const data = await res.json();

    if (!res.ok) {
      const errorParsed = tavilyErrorSchema.safeParse(data);
      if (errorParsed.success) {
        throw new Error(`Tavily API error: ${errorParsed.data.detail.error}`);
      } else {
        throw new Error(
          `Tavily API error: HTTP ${res.status} - ${JSON.stringify(data)}`
        );
      }
    }

    const parsed = tavilySearchResponseSchema.parse(data);
    const results: SearchResult[] = parsed.results.map((item) => ({
      url: item.url,
      title: item.title,
    }));

    return { results };
  }

  async extractContent(urls: string[]) {
    const res = await fetch("https://api.tavily.com/extract", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ urls }),
    });

    const data = await res.json();

    if (!res.ok) {
      const errorParsed = tavilyErrorSchema.safeParse(data);
      if (errorParsed.success) {
        throw new Error(`Tavily API error: ${errorParsed.data.detail.error}`);
      } else {
        throw new Error(
          `Tavily API error: HTTP ${res.status} - ${JSON.stringify(data)}`
        );
      }
    }

    const parsed = tavilyExtractResponseSchema.parse(data);
    const results: ExtractedContent[] = parsed.results.map((item) => ({
      url: item.url,
      title: item.title,
      content: item.raw_content,
    }));

    return { results };
  }
}
