/**
 * 统一响应接口
 */
export interface IResponse<T = any> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
}

/**
 * 分页响应接口
 */
export interface IPaginationResponse<T = any> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}
