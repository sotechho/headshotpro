import axios, { type AxiosRequestConfig } from "axios";

const devUrl =
  process.env.NEXT_PUBLIC_DEV_BASE_URL || "http://localhost:8000/api/v1/";
const prodUrl = process.env.NEXT_PUBLIC_PROD_BASE_URL;

const baseUrl = process.env.NODE_ENV === "development" ? devUrl : prodUrl;

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown,
  ) {
    super(message);
  }
}

const axiosInstance = axios.create({
  baseURL: baseUrl,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export const api = {
  get: <T = unknown>(
    endpoint: string,
    config?: AxiosRequestConfig,
  ): Promise<T> =>
    axiosInstance
      .get<ApiResponse<T>>(endpoint, config)
      .then((res) => res.data.data as T),

  post: <T = unknown>(
    endpoint: string,
    body?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> =>
    axiosInstance
      .post<ApiResponse<T>>(endpoint, body, config)
      .then((res) => res.data.data as T),
  put: <T = unknown>(
    endpoint: string,
    body?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> =>
    axiosInstance
      .put<ApiResponse<T>>(endpoint, body, config)
      .then((res) => res.data.data as T),
  patch: <T = unknown>(
    endpoint: string,
    body?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> =>
    axiosInstance
      .patch<ApiResponse<T>>(endpoint, body, config)
      .then((res) => res.data.data as T),
  delete: <T = unknown>(
    endpoint: string,
    config?: AxiosRequestConfig,
  ): Promise<T> =>
    axiosInstance
      .delete<ApiResponse<T>>(endpoint, config)
      .then((res) => res.data.data as T),
};
