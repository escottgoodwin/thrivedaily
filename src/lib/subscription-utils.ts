import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from './firebase';

export async function isUserSubscribed(userId: string): Promise<boolean> {
    if (!userId) {
        return false;
    }

    try {
        const subscriptionsQuery = query(
            collection(db, 'users', userId, 'subscriptions'),
            where('status', 'in', ['trialing', 'active']),
            limit(1)
        );

        const snapshot = await getDocs(subscriptionsQuery);
        return !snapshot.empty;
    } catch (error) {
        console.error("Error checking subscription status:", error);
        return false; // Fail-safe to false
    }
}
