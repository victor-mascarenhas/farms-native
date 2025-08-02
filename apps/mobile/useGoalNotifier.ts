import { useEffect } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
  addDoc,
  updateDoc,
  DocumentSnapshot,
} from "firebase/firestore";
import { useAuth } from "./AuthProvider";
import { db } from "@farms/firebase";
import { goalSchema } from "@farms/schemas";
import { z } from "zod";
import {
  getAllFromCollection,
  addToCollection,
  updateInCollection,
  removeFromCollection,
} from "@farms/firebase/src/firestoreUtils";

const typedGoal = goalSchema;
type Goal = z.infer<typeof typedGoal>;

export default function useGoalNotifier() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const goalsQuery = query(
      collection(db, "goals"),
      where("created_by", "==", user.uid),
      where("notified", "==", false)
    );

    const checkGoal = async (doc: DocumentSnapshot) => {
      const goal = typedGoal.parse(doc.data());
      const collName = goal.type === "venda" ? "sales" : "productions";
      const data = await getAllFromCollection<any>(
        collName,
        user.uid,
        "created_by",
        [where("product_id", "==", goal.product_id)]
      );
      const total = data.reduce((sum, d) => sum + (d.quantity || 0), 0);
      if (total >= goal.target_quantity) {
        await addToCollection(
          "notifications",
          {
            user_id: user.uid,
            message: `Meta de ${goal.type} do produto atingida!`,
            created_at: new Date(),
            read: false,
          },
          user.uid,
          "user_id"
        );
        await updateInCollection("goals", doc.id, { notified: true }, user.uid);
      }
    };

    const checkGoalsForProduct = async (
      type: "venda" | "producao",
      productId: string
    ) => {
      const data = await getAllFromCollection<any>(
        "goals",
        user.uid,
        "created_by",
        [
          where("notified", "==", false),
          where("type", "==", type),
          where("product_id", "==", productId),
        ]
      );
      await Promise.all(
        data.map(async (goal) => {
          // Simular DocumentSnapshot para compatibilidade
          await checkGoal({
            id: goal.id,
            data: () => goal,
            ref: { id: goal.id },
          } as any);
        })
      );
    };

    const unsubGoals = onSnapshot(goalsQuery, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type !== "removed") {
          checkGoal(change.doc);
        }
      });
    });

    const salesQuery = query(
      collection(db, "sales"),
      where("created_by", "==", user.uid)
    );
    const unsubSales = onSnapshot(salesQuery, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added" || change.type === "modified") {
          const pid = (change.doc.data() as any).product_id;
          checkGoalsForProduct("venda", pid);
        }
      });
    });

    const prodQuery = query(
      collection(db, "productions"),
      where("created_by", "==", user.uid)
    );
    const unsubProd = onSnapshot(prodQuery, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added" || change.type === "modified") {
          const pid = (change.doc.data() as any).product_id;
          checkGoalsForProduct("producao", pid);
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
