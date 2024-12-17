// errorHandler.js
export const handleError = (error, context = "") => {
  // Log the error for debugging (can be sent to a logging service)
  console.error(`Error in ${context}:`, error);

  // Return a user-friendly error message
  return {
    success: false,
    title: `An error occurred${context ? ` in ${context}` : ""}`,
    message: error?.message || "Something went wrong. Please try again later.",
    tone: "critical", // Critical tone for the UI to display
  };
};
