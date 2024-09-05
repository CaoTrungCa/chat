"use client";
import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebaseConfig";

export default function ListUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const router = useRouter();
  const currentUser = auth.currentUser;

  useEffect(() => {
    if (currentUser) {
      const usersQuery = query(
        collection(db, "accounts"),
        where("uid", "!=", currentUser.uid)
      );
      const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
        const userList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(userList);
      });
      return () => unsubscribe();
    }
  }, [currentUser]);

  const handlePrivateChat = (recipientId: string) => {
    const chatId =
      (currentUser as any).uid > recipientId
        ? `${(currentUser as any).uid}_${recipientId}`
        : `${recipientId}_${(currentUser as any).uid}`;
    router.push(`/chat/private-chat/${chatId}`);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Users</h1>
      <div className="mt-4 grid grid-cols-4 gap-4">
        {users.map((user) => (
          <div key={user.uid} className="col-span-1 border p-4 rounded-lg">
            <h2 className="text-xl font-semibold">{user.displayName}</h2>
            <button
              className="mt-2 px-4 py-2 w-full bg-blue-500 text-white rounded"
              onClick={() => handlePrivateChat(user.uid)}
            >
              Private Chat
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
