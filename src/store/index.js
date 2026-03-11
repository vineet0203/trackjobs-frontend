// store/index.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import fileUploadReducer from "./slices/fileUploadSlice";
import uiReducer from "./slices/uiSlice";
import clientReducer from "./slices/features/clientSlice";
import quoteReducer from "./slices/features/quoteSlice";
import jobReducer from "./slices/features/jobSlice";
import employeeReducer from "./slices/features/employeeSlice";
import scheduleReducer from "./slices/features/scheduleSlice";

// Custom middleware for API error handling
const apiMiddleware = (store) => (next) => (action) => {
  // You can add global API error handling here
  if (action.type.endsWith("/rejected")) {
    // Log to error tracking service
    console.error("API Error:", action.error);

    // You could dispatch a notification here
    // store.dispatch(addNotification({ type: 'error', message: action.payload }));
  }
  return next(action);
};

export const store = configureStore({
  reducer: {
    auth: authReducer,
    fileUpload: fileUploadReducer,
    ui: uiReducer,
    clients: clientReducer,
    quotes: quoteReducer,
    jobs: jobReducer,
    employees: employeeReducer,
    schedules: scheduleReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore non-serializable values in these paths
        ignoredActions: [
          "persist/PERSIST",
          "clients/createClient/fulfilled",
          "clients/updateClient/fulfilled",
          "quotes/createQuote/fulfilled",
          "quotes/updateQuote/fulfilled",
          "jobs/createJob/fulfilled",
          "jobs/updateJob/fulfilled",
          "jobs/addAttachment/fulfilled",
          "schedules/createSchedule/fulfilled",
        ],
        ignoredActionPaths: ["meta.arg", "payload.timestamp"],
        ignoredPaths: [
          "clients.currentClient.logo",
          "clients.clients.logo",
          "quotes.currentQuote.items",
          "jobs.currentJob.tasks",
          "jobs.currentJob.attachments_by_context",
        ],
      },
    }).concat(apiMiddleware),
  devTools: process.env.NODE_ENV !== "production",
});

export default store;
