import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import { collection, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import { db } from '@farms/firebase';
import { useAuth } from './AuthProvider';

const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'notifications'),
      where('user_id', '==', user.uid),
      where('read', '==', false)
    );

    const unsub = onSnapshot(q, snapshot => {
      snapshot.docChanges().forEach(change => {
        if (change.type === 'added') {
          const notif = change.doc.data();
          Alert.alert('Meta atingida', (notif as any).message);
          updateDoc(change.doc.ref, { read: true });
        }
      });
    });
    return unsub;
  }, [user]);

  return <>{children}</>;
};

export default NotificationProvider;
