export const notifyUpdate = () => {
  window.dispatchEvent(new Event("notificationsUpdated"));
};