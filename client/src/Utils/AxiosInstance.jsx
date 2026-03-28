import axios from "axios";
import { errorMessage, successMessage } from "./Alert";

export const BASE_URL = "http://127.0.0.1:8000/api/";

export const hostUrl = "https://dbs.secuber.io/";

const statusCodes = [
  // Client-Side Errors (400-499)
  {
    code: 400,
    message:
      "Bad Request: The request cannot be processed due to client error.",
  },
  { code: 401, message: "Unauthorized: Please login again." },
  {
    code: 403,
    message: "Forbidden: You do not have permission to access this resource.",
  },
  {
    code: 404,
    message: "Not Found: The requested resource could not be found.",
  },
  { code: 405, message: "Method Not Allowed: This action is not permitted." },
  {
    code: 408,
    message: "Request Timeout: The request took too long to process.",
  },
  {
    code: 409,
    message:
      "Conflict: There is a conflict with the current state of the resource.",
  },
  {
    code: 410,
    message: "Gone: The requested resource is no longer available.",
  },
  {
    code: 413,
    message: "Payload Too Large: The request payload exceeds the limit.",
  },
  {
    code: 429,
    message: "Too Many Requests: You have exceeded the allowed request limit.",
  },

  // Server-Side Errors (500-599)
  {
    code: 500,
    message: "Internal Server Error: Something went wrong on the server.",
  },
  {
    code: 501,
    message:
      "Not Implemented: The server does not recognize the request method.",
  },
  {
    code: 502,
    message:
      "Bad Gateway: The server received an invalid response from the upstream server.",
  },
  {
    code: 503,
    message: "Service Unavailable: The server is currently unavailable.",
  },
  {
    code: 504,
    message: "Gateway Timeout: The server took too long to respond.",
  },
  {
    code: 505,
    message:
      "HTTP Version Not Supported: The server does not support the HTTP protocol version used.",
  },
];

let userToken;
try {
  userToken = JSON.parse(localStorage.getItem("token"));
} catch (error) {
  console.error("Invalid token in localStorage", error);
  userToken = null;
  localStorage.removeItem("token");
  localStorage.clear();
}

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json", // default to JSON
    ...(userToken && { Authorization: `Bearer ${userToken}` }), // add token only if exists
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    if (config.method === "patch" || config.method === "put") {
      const userConfirmed = window.confirm(
        "Are you sure you want to update this data?",
      );
      if (!userConfirmed) {
        // If the user cancels, reject the request
        return Promise.reject({ message: "Update Request was cancelled :)" });
      }
    }
    if (config.method === "delete") {
      const userConfirmed = window.confirm(
        "Are you sure you want to delete this data?",
      );
      if (!userConfirmed) {
        // If the user cancels, reject the request
        return Promise.reject({ message: "Delete Request was cancelled :)" });
      }
    }

    if (config.data instanceof FormData) {
      // Store FormData object in a custom property in config
      // config.formData = config.data;
      config.headers["X-Request-Type"] = "FormData";
    } else if (typeof config.data === "object" && config.data !== null) {
      config.headers["X-Request-Type"] = "JSON";
    }
    return config;
  },
  (error) => {
    errorMessage(error.message || "Network Error: Unable to reach the server.");
    return Promise.reject(error);
  },
);

axiosInstance.interceptors.response.use(
  function (response) {
    if (response.config.method !== "get") {
      successMessage(response?.data?.message || response?.statusText);
    }
    return response;
  },
  function (error) {
    if (error.response) {
      sessionStorage.clear();
      const requestType = error.config.headers["X-Request-Type"];
      const formData = error.config.data; // FormData object
      if (requestType === "FormData") {
        const arrays = {};
        const objects = {};
        const strings = {};

        // Convert FormData to an object
        const formDataObject = {};
        formData.forEach((value, key) => {
          if (value instanceof File) {
            formDataObject[key] = {
              fileName: value.name,
              fileType: value.type,
            }; // Serialize file data
          } else if (Array.isArray(value)) {
            arrays[key] = value;
          } else if (typeof value === "object" && value !== null) {
            objects[key] = value;
          } else if (typeof value === "string") {
            strings[key] = value;
          }
        });

        // Store data in sessionStorage
        sessionStorage.setItem("jsonFormData", JSON.stringify(strings));
        sessionStorage.setItem("arrayPayload", JSON.stringify(arrays));
        sessionStorage.setItem("objectPayload", JSON.stringify(objects));
        sessionStorage.setItem("files", JSON.stringify(formDataObject));
        sessionStorage.setItem("token", JSON.stringify(userToken));
      }
      if (requestType === "JSON") {
        const arrays = {};
        const objects = {};
        const strings = {};
        const parsedJson = JSON.parse(formData);

        Object.keys(parsedJson).forEach((key) => {
          const value = parsedJson[key];
          // console.log(value);

          if (Array.isArray(value)) {
            arrays[key] = value;
          } else if (typeof value === "object" && value !== null) {
            objects[key] = value;
          } else if (typeof value === "string") {
            strings[key] = value;
          }
        });
        // console.log(strings);
        // console.log(arrays);
        // console.log(objects);

        // If not FormData, use the frontend payload
        sessionStorage.setItem("jsonFormData", JSON.stringify(strings));
        sessionStorage.setItem("arrayPayload", JSON.stringify(arrays));
        sessionStorage.setItem("objectPayload", JSON.stringify(objects));
        sessionStorage.setItem("token", JSON.stringify(userToken));
      }

      const status = error.response.status;
      const errorDetail = statusCodes.find((e) => e.code === status);

      // Check if the response contains raw HTML
      const contentType = error.response.headers["content-type"];
      const isHtmlError =
        contentType?.includes("text/html") &&
        typeof error.response.data === "string";

      // Other necessary variables
      // const frontendPayload = error.config?.data || {};
      const requestMethod = error.config.method.toUpperCase();
      const fullUrl = `${error.config.baseURL}${error.config.url}`;

      if (isHtmlError) {
        // Redirect to the dedicated HTML error route with the content
        sessionStorage.setItem(
          "htmlContent",
          JSON.stringify(error.response.data),
        );
        sessionStorage.setItem("url", JSON.stringify(fullUrl));
        sessionStorage.setItem("method", JSON.stringify(requestMethod));
        // window.location.href = `/html-error`;
      } else {
        // Extract the message or fallback
        const message =
          error.response.data?.message ||
          error.response.data?.error ||
          (errorDetail
            ? `${errorDetail.code} - ${errorDetail.message}`
            : "An unexpected error occurred.");
        errorMessage(message);
      }

      if (status === 401) {
        localStorage.removeItem("token-newPanel");
        localStorage.clear();
        window.location.href = "/login";
      } else if (status === 403) {
        window.location.href = "/no-permission";
        localStorage.clear();
      }
    } else {
      errorMessage(
        error.message || "Network Error: Unable to reach the server.",
      );
    }
    return Promise.reject(error);
  },
);
