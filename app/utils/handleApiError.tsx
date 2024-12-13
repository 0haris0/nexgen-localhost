// Utility function for error handling
export type ErrorHandler = {
  success: false;
  error: string;
};

export const handleApiError = (e: unknown, message: string): ErrorHandler => {
  // Check if the error is an instance of Error
  if (e instanceof Error) {
    const errorMessage = e.message || "Unknown error";
    console.error(`${message}:`, errorMessage, e.stack || "");
    return {
      success: false,
      error: `${message}: ${errorMessage}`,
    };
  }

  // Handle cases where the error is not an instance of Error
  console.error(`${message}:`, e);
  return {
    success: false,
    error: `${message}: ${String(e)}`, // Convert non-Error objects to string
  };
};
