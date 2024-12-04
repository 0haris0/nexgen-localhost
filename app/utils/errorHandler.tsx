// utils/errorHandler.js

// Error Handling Utility
export const handleErrorResponse = (message: string) => {
  return {
    success: false,
    error: message,
  };
};
