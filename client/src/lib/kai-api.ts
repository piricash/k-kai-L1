/** Kākāriki Kai API client: all protected calls obtain an in-memory Kinde bearer token at request time. */
import axios from "axios";
import { getKakarikiKaiWebAPI, type WeeklyMenuResponse } from "@/api/generated/kakarikiKai";
import { getKindeAccessToken } from "./kinde";

export type ApiWeeklyMenu = WeeklyMenuResponse;

const apiBaseUrl = import.meta.env.VITE_KAKARIKI_API_URL?.replace(/\/$/, "");

export function isApiConfigured(): boolean {
  return Boolean(apiBaseUrl);
}

export async function getAuthenticatedWeeklyMenu(): Promise<ApiWeeklyMenu> {
  if (!apiBaseUrl) throw new Error("The Kākāriki Kai API URL is not configured.");
  const client = getKakarikiKaiWebAPI(
    axios.create({
      baseURL: apiBaseUrl,
      headers: { Authorization: `Bearer ${await getKindeAccessToken()}` },
    }),
  );
  return (await client.getNextWeekMenu()).data;
}
