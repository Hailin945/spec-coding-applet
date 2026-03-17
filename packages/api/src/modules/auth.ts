// 认证相关 API
import type { LoginRequest, AppletLoginRequest, LoginResponse } from '@spec-coding/types';
import { HttpClient } from '../index';

// 注意：实际使用时需要在各端初始化时传入 baseURL 和 getToken
// 这里只是定义接口，不创建实例

export class AuthApi {
  constructor(private client: HttpClient) {}

  /**
   * PC 端登录（账号密码）
   */
  async webLogin(data: LoginRequest): Promise<LoginResponse> {
    return this.client.post<LoginResponse>('/web/auth/login', data);
  }

  /**
   * 小程序登录（微信 code）
   */
  async appletLogin(data: AppletLoginRequest): Promise<LoginResponse> {
    return this.client.post<LoginResponse>('/applet/auth/login', data);
  }

  /**
   * 获取当前用户信息
   */
  async getUserInfo(): Promise<LoginResponse['userInfo']> {
    return this.client.get<LoginResponse['userInfo']>('/auth/me');
  }

  /**
   * 登出
   */
  async logout(): Promise<void> {
    return this.client.post<void>('/auth/logout');
  }
}
