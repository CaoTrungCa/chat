"use client";
import { useEffect, useState } from "react";
import {
  collection,
  query,
  onSnapshot,
  updateDoc,
  arrayRemove,
  arrayUnion,
  doc,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebaseConfig";
import Link from "next/link";

export default function ListGroups() {
  const user = auth.currentUser;
  const [groups, setGroups] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const q = query(collection(db, "publicGroups"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const groupList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setGroups(groupList);
    });
    return () => unsubscribe();
  }, []);

  const handleJoinGroup = async (groupId: string) => {
    const groupRef = doc(db, "publicGroups", groupId);

    await updateDoc(groupRef, {
      participants: arrayUnion(user?.uid),
    });

    router.push(`/chat/${groupId}`);
  };

  const handleLeaveGroup = async (groupId: string) => {
    const groupRef = doc(db, "publicGroups", groupId);

    await updateDoc(groupRef, {
      participants: arrayRemove(user?.uid),
    });
    router.push("/chat");
  };

  const handleCreateGroup = () => {
    router.push("/create-group")
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Chat Groups</h1>
        <button type="button" onClick={() => handleCreateGroup()}
          className="px-4 py-2 bg-blue-500 text-white rounded self-center">
          New
        </button>
      </div>
      <div className="mt-4 grid grid-cols-4 gap-4">
        {groups.map((group) => (
          <div
            key={group.id}
            className="col-span-1 border p-4 rounded-lg flex flex-col justify-between"
          >
            {group?.participants.includes(user?.uid) ? (
              <>
                <Link href={`/chat/${group.id}`} className="flex-grow">
                  <h2 className="text-xl font-bold break-words line-clamp-2 h-14">
                    {group.groupName}
                  </h2>
                </Link>
                <button
                  className="mt-2 px-4 py-2 w-full bg-red-500 text-white rounded self-center"
                  onClick={() => handleLeaveGroup(group.id)}
                >
                  Leave Group
                </button>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold break-words line-clamp-2 h-14">
                  {group.groupName}
                </h2>
                 <button
                  className="mt-2 px-4 py-2 w-full bg-blue-500 text-white rounded self-center"
                  onClick={() => handleJoinGroup(group.id)}
                >
                  Join Group
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
