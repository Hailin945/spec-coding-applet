// 共享常量入口文件

// ============ API 响应码 ============
export enum ApiCode {
  SUCCESS = 0,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  SERVER_ERROR = 500,
  INVALID_PARAMS = 400,
}

// ============ 错误消息 ============
export const ErrorMessage = {
  [ApiCode.UNAUTHORIZED]: '未登录或登录已过期',
  [ApiCode.FORBIDDEN]: '无权限访问',
  [ApiCode.NOT_FOUND]: '资源不存在',
  [ApiCode.SERVER_ERROR]: '服务器错误',
  [ApiCode.INVALID_PARAMS]: '参数错误',
} as const;

// ============ 存储 Key ============
export const StorageKey = {
  TOKEN: 'token',
  USER_INFO: 'userInfo',
} as const;

// ============ 路由路径 ============
export const RoutePath = {
  // 小程序路由
  APPLET_HOME: '/pages/home/index',
  APPLET_LOGIN: '/pages/login/index',

  // PC 端路由
  WEB_HOME: '/',
  WEB_LOGIN: '/login',
} as const;
