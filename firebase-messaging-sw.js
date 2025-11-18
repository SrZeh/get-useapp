/* global importScripts, firebase */
// Firebase Messaging Service Worker (Web Push)
// Nota: Para FCM v9 modular, usamos importScripts para os pacotes compat no SW.

importScripts("https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js");

firebase.initializeApp({
  apiKey: "AIzaSyDgl2Bpk86KmwKvs_z83p5ZADlBaz9LwRk",
  authDomain: "upperreggae.firebaseapp.com",
  projectId: "upperreggae",
  messagingSenderId: "497063452237",
  appId: "1:497063452237:web:9b80a81d703be95fab8604",
});

const messaging = firebase.messaging();

// Exibe notificação quando chega em segundo plano
messaging.setBackgroundMessageHandler(function (payload) {
  const title = payload?.notification?.title || "Get & Use";
  const body = payload?.notification?.body || "";
  const link = payload?.data?.link;
  const options = {
    body,
    data: link ? { link } : undefined,
    icon: "/favicon.png",
  };
  return self.registration.showNotification(title, options);
});

self.addEventListener("notificationclick", function (event) {
  const link = event?.notification?.data?.link;
  event.notification.close();
  if (link) {
    event.waitUntil(clients.openWindow(link));
  }
});


