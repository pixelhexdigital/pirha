// Base URL for the API
export const BASE_URL = import.meta.env.DEV
  ? "http://localhost:8080"
  : `https://pirha-api.onrender.com`;

// Path to the icons used in the app
const ICONS = {};

const IMAGES = {
  LOGO_WHITE: new URL("../assets/pirha_logo_white.png", import.meta.url).href,
};

// HTTP methods
export const HTTP_REQUEST_METHODS = {
  GET: "GET",
  POST: "POST",
  PATCH: "PATCH",
  PUT: "PUT",
  DELETE: "DELETE",
};

// HTTP status codes
export const HTTP_STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

// HTTP error messages
export const HTTP_ERROR_MESSAGES = {
  [HTTP_STATUS_CODES.BAD_REQUEST]: "Bad request",
  [HTTP_STATUS_CODES.UNAUTHORIZED]: "Unauthorized",
  [HTTP_STATUS_CODES.NOT_FOUND]: "Not found",
  [HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR]: "Internal server error",
};

// API error messages
export const API_ERROR_MESSAGES = {
  NETWORK_ERROR: "Network error. Please check your internet connection.",
  SERVER_ERROR: "Server error. Please try again later.",
  NOT_FOUND: "The resource you requested was not found.",
  UNAUTHORIZED: "You are not authorized to access this resource.",
  BAD_REQUEST: "Bad request.",
  UNKNOWN_ERROR: "Unknown error.",
};

export { ICONS, IMAGES };
