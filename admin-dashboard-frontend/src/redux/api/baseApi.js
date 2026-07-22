import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  isDeviceConflictError,
  refreshAccessToken,
} from "../../utils/authSession";
import { clearAuthToken, getAuthToken } from "../../utils/tokenService";

const trimTrailingSlash = (value) => value?.replace(/\/+$/, "");

const apiBaseUrl = trimTrailingSlash(import.meta.env.VITE_API_URL);

if (!apiBaseUrl) {
  throw new Error("VITE_API_URL is missing");
}

export const mediaBaseUrl = trimTrailingSlash(import.meta.env.VITE_MEDIA_URL);

if (!mediaBaseUrl) {
  throw new Error("VITE_MEDIA_URL is missing");
}

const rawBaseQuery = fetchBaseQuery({
  baseUrl: apiBaseUrl,
  credentials: "include",
  prepareHeaders: (headers) => {
    if (headers.has("Authorization")) {
      return headers;
    }

    const token = getAuthToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result?.error && isDeviceConflictError(result.error)) {
    clearAuthToken();
    return result;
  }

  if (result?.error?.status !== 401) {
    return result;
  }

  const nextAccessToken = await refreshAccessToken();

  if (!nextAccessToken) {
    clearAuthToken();
    return result;
  }

  result = await rawBaseQuery(args, api, extraOptions);

  if (result?.error && isDeviceConflictError(result.error)) {
    clearAuthToken();
    return result;
  }

  if (result?.error?.status === 401) {
    clearAuthToken();
  }

  return result;
};

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "Profile",
    "Customer",
    "Merchant",
    "Statistics",
    "SalesRep",
    "User",
    "AuditLog",
    "Notifications",
    "CashCollection",
    "RevenuePerUser",
    "PointsRedeemed",
    "AuditLog",
    "Package",
    "Tier",
    "MerchantPrivacyPolicy",
    "CustomerPrivacyPolicy",
    "Promo",
    "PushNotification",
    "ReportAnalytics",
  ],
  endpoints: () => ({}),
});
