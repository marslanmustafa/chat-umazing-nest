// src/utils/response.helper.ts
export function success(message: string, data: any) {
  return { success: true, message, data };
}

export function failure(message: string) {
  return { success: false, message, data: null };
}
