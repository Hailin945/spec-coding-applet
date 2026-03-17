// API 调用封装入口文件
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import type { ApiResponse } from '@spec-coding/types';
import { ApiCode } from '@spec-coding/constants';

// ============ HTTP 客户端基类 ============
export class HttpClient {
  private instance: AxiosInstance;

  constructor(baseURL: string, getToken?: () => string | null) {
    this.instance = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 请求拦截器：自动附加 token
    this.instance.interceptors.request.use((config) => {
      const token = getToken?.();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // 响应拦截器：统一处理错误
    this.instance.interceptors.response.use(
      (response) => {
        const data = response.data as ApiResponse;
        if (data.code !== ApiCode.SUCCESS) {
          return Promise.reject(new Error(data.message));
        }
        return response;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.get<ApiResponse<T>>(url, config);
    return response.data.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.post<ApiResponse<T>>(url, data, config);
    return response.data.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.put<ApiResponse<T>>(url, data, config);
    return response.data.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.delete<ApiResponse<T>>(url, config);
    return response.data.data;
  }
}

// ============ 导出 API 模块（示例） ============
// 实际使用时，在 src/modules/ 下按业务模块拆分
export * from './modules/auth';
