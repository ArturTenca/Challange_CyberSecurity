import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/**
 * Initialize notifications
 */
export const initializeNotifications = async (): Promise<void> => {
  // Set up notification behavior
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });

  // Request permissions (iOS)
  if (Platform.OS === 'ios') {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      console.warn('Notification permissions not granted');
    }
  }

  // Android: create notification channel
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }
};

/**
 * Send local notification
 */
export const sendLocalNotification = async (options: {
  title: string;
  body: string;
  data?: Record<string, any>;
  delay?: number;
}): Promise<string> => {
  const { title, body, data = {}, delay = 0 } = options;

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: 'default',
      badge: 1,
    },
    trigger: delay > 0 ? { seconds: delay } : null,
  });

  return notificationId;
};

/**
 * Subscribe to notifications
 */
export const subscribeToNotifications = (
  handler: (notification: Notifications.Notification) => void
): (() => void) => {
  const subscription = Notifications.addNotificationReceivedListener(handler);
  return () => subscription.remove();
};

/**
 * Subscribe to notification responses
 */
export const subscribeToNotificationResponses = (
  handler: (response: Notifications.NotificationResponse) => void
): (() => void) => {
  const subscription = Notifications.addNotificationResponseReceivedListener(
    handler
  );
  return () => subscription.remove();
};

/**
 * Cancel notification
 */
export const cancelNotification = async (
  notificationId: string
): Promise<void> => {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
};

/**
 * Cancel all notifications
 */
export const cancelAllNotifications = async (): Promise<void> => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};

/**
 * Send notification for vehicle data update
 */
export const notifyVehicleUpdate = async (vehicleName: string): Promise<void> => {
  await sendLocalNotification({
    title: '🚗 Novo Veículo Disponível',
    body: `${vehicleName} agora está disponível no app!`,
    data: { type: 'vehicle_update', vehicle: vehicleName },
  });
};

/**
 * Send notification for special offer
 */
export const notifySpecialOffer = async (offer: string): Promise<void> => {
  await sendLocalNotification({
    title: '🎁 Oferta Especial',
    body: offer,
    data: { type: 'special_offer' },
  });
};

/**
 * Send sync notification
 */
export const notifySyncComplete = async (status: 'success' | 'error'): Promise<void> => {
  await sendLocalNotification({
    title: status === 'success' ? '✅ Sincronização Completa' : '⚠️ Erro na Sincronização',
    body:
      status === 'success'
        ? 'Seus dados foram atualizados com sucesso'
        : 'Houve um erro ao sincronizar. Tente novamente.',
    data: { type: 'sync_status', status },
  });
};

export type { Notifications };

