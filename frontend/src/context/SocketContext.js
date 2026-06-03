import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { SOCKET_URL } from '../config';
import api from '../api/axios';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token || !user) return;

    const socket = io(SOCKET_URL, { auth: { token } });
    socketRef.current = socket;

    socket.on('new-notification', (notif) => {
      setNotifications(prev => [notif, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    socket.on('clear-notifications', () => {
      fetchNotifications();
    });

    return () => { socket.disconnect(); socketRef.current = null; };
  }, [user]);

  useEffect(() => {
    if (!user) { setNotifications([]); setUnreadCount(0); }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
      setUnreadCount(res.data.filter(n => !n.lu).length);
    } catch {}
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/lu`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, lu: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {}
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/lu-tout');
      setNotifications(prev => prev.map(n => ({ ...n, lu: true })));
      setUnreadCount(0);
    } catch {}
  };

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead }}>
      {children}
    </SocketContext.Provider>
  );
};
