import dotenv from "dotenv";
import {
  SearchResult,
  SearchV2Response,
  SearchResultType,
} from "../../lib/entities";
import * as Sentry from "@sentry/node";
import { logger } from "../../lib/logger";

dotenv.config();

export async function fire_engine_search_v2(
  q: string,
  options: {
    tbs?: string;
    filter?: string;
    lang?: string;
    country?: string;
    location?: string;
    numResults: number;
    page?: number;
    type?: SearchResultType | SearchResultType[];
  },
  abort?: AbortSignal,
): Promise<SearchV2Response> {
  try {
    let data = JSON.stringify({
      query: q,
      lang: options.lang,
      country: options.country,
      location: options.location,
      tbs: options.tbs,
      numResults: options.numResults,
      page: options.page ?? 1,
      type: options.type || "web",
    });

    if (!process.env.FIRE_ENGINE_BETA_URL) {
      return {};
    }

    const response = await fetch(
      `${process.env.FIRE_ENGINE_BETA_URL}/v2/search`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Disable-Cache": "true",
        },
        body: data,
        signal: abort,
      },
    );

    if (response.ok) {
      const responseData = await response.json();
      return responseData;
    } else {
      return {};
    }
  } catch (error) {
    logger.error(error);
    Sentry.captureException(error);
    return {};
  }
}
