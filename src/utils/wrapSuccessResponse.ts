export function wrapSuccessResponse<T>(data: T, message?: T) {
  return {
    success: true,
    data,
    ...(message && { message }),
  };
}
