import apiClient from "./client";

// GET /notifications/unread_count -> { unread_count: N }
export const getUnreadNotificationCount = () =>
  apiClient.get("/notifications/unread_count");

// GET /notifications?limit=&before= -> Notification[]
export const listNotifications = ({ limit = 20, before = null } = {}) =>
  apiClient.get("/notifications", {
    params: { limit, before },
  });

// POST /notifications/mark_as_read { notification_ids: [...] } -> { updated: N }
export const markNotificationsRead = (notificationIds) =>
  apiClient.post("/notifications/mark_as_read", {
    notification_ids: notificationIds,
  });