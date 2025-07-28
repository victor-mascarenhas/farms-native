import { useEffect } from 'react';
import { collection, query, where, onSnapshot, getDocs, addDoc, updateDoc } from 'firebase/firestore';
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

    const q = query(
      collection(db, 'goals'),
      where('created_by', '==', user.uid),
      where('notified', '==', false)
    );

    const unsubGoals = onSnapshot(q, async (snapshot) => {
      for (const change of snapshot.docChanges()) {
        const goal = typedGoal.parse(change.doc.data());
        const collName = goal.type === 'venda' ? 'sales' : 'productions';
        const dataSnap = await getDocs(
          query(
            collection(db, collName),
            where('created_by', '==', user.uid),
            where('product_id', '==', goal.product_id)
          )
        );
        const total = dataSnap.docs.reduce((sum, d) => sum + (d.data() as any).quantity, 0);
        if (total >= goal.target_quantity) {
          await addDoc(collection(db, 'notifications'), {
            user_id: user.uid,
            message: `Meta de ${goal.type} do produto atingida!`,
            created_at: new Date(),
            read: false,
          });
          await updateDoc(change.doc.ref, { notified: true });
        }
      }
    });

    return () => unsubGoals();
  }, [user]);
}
