import { useEffect } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
  addDoc,
  updateDoc,
  DocumentSnapshot,
} from 'firebase/firestore';
import { useAuth } from './AuthProvider';
import { db } from './firebaseConfig';
import { goalSchema } from './schemas/firebaseSchemas';
import { z } from 'zod';

const typedGoal = goalSchema;
type Goal = z.infer<typeof typedGoal>;

export default function useGoalNotifier() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const goalsQuery = query(
      collection(db, 'goals'),
      where('created_by', '==', user.uid),
      where('notified', '==', false)
    );

    const checkGoal = async (doc: DocumentSnapshot) => {
      const goal = typedGoal.parse(doc.data());
      const collName = goal.type === 'venda' ? 'sales' : 'productions';
      const dataSnap = await getDocs(
        query(
          collection(db, collName),
          where('created_by', '==', user.uid),
          where('product_id', '==', goal.product_id)
        )
      );
      const total = dataSnap.docs.reduce(
        (sum, d) => sum + (d.data() as any).quantity,
        0
      );
      if (total >= goal.target_quantity) {
        await addDoc(collection(db, 'notifications'), {
          user_id: user.uid,
          message: `Meta de ${goal.type} do produto atingida!`,
          created_at: new Date(),
          read: false,
        });
        await updateDoc(doc.ref, { notified: true });
      }
    };

    const checkGoalsForProduct = async (
      type: 'venda' | 'producao',
      productId: string
    ) => {
      const snap = await getDocs(
        query(
          collection(db, 'goals'),
          where('created_by', '==', user.uid),
          where('notified', '==', false),
          where('type', '==', type),
          where('product_id', '==', productId)
        )
      );
      await Promise.all(snap.docs.map(checkGoal));
    };

    const unsubGoals = onSnapshot(goalsQuery, snapshot => {
      snapshot.docChanges().forEach(change => {
        if (change.type !== 'removed') {
          checkGoal(change.doc);
        }
      });
    });

    const salesQuery = query(
      collection(db, 'sales'),
      where('created_by', '==', user.uid)
    );
    const unsubSales = onSnapshot(salesQuery, snapshot => {
      snapshot.docChanges().forEach(change => {
        if (change.type === 'added' || change.type === 'modified') {
          const pid = (change.doc.data() as any).product_id;
          checkGoalsForProduct('venda', pid);
        }
      });
    });

    const prodQuery = query(
      collection(db, 'productions'),
      where('created_by', '==', user.uid)
    );
    const unsubProd = onSnapshot(prodQuery, snapshot => {
      snapshot.docChanges().forEach(change => {
        if (change.type === 'added' || change.type === 'modified') {
          const pid = (change.doc.data() as any).product_id;
          checkGoalsForProduct('producao', pid);
        }
      });
    });

    return () => {
      unsubGoals();
      unsubSales();
      unsubProd();
    };
  }, [user]);
}
