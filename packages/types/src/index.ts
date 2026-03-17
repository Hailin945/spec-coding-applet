// 共享类型定义入口文件

// ============ 通用类型 ============
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

export interface PaginationRequest {
  page: number;
  pageSize: number;
}

export interface PaginationResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

// ============ 认证相关 ============
export interface LoginRequest {
  username: string;
  password: string;
}

export interface AppletLoginRequest {
  code: string; // 微信 wx.login() 返回的 code
}

export interface LoginResponse {
  token: string;
  userInfo: UserInfo;
}

export interface UserInfo {
  id: string;
  username: string;
  nickname?: string;
  avatar?: string;
}

// ============ 示例：工具类业务实体 ============
// 根据实际业务替换
export interface ToolEntity {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}
