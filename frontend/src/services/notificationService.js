import { api } from "./api.js";

export const notificationService = {
  async getAll() {
    const { data } = await api.get("/notifications");
    return data.data || { notifications: [], unreadCount: 0 };
  },

  async create({ title, message, type }) {
    const { data } = await api.post("/notifications", { title, message, type });
    return data.data.notification;
  },

  async markAsRead(id) {
    await api.put(`/notifications/${id}/read`);
  },

  async markAllAsRead() {
    await api.put("/notifications/read-all");
  },

  async delete(id) {
    await api.delete(`/notifications/${id}`);
  },
};
