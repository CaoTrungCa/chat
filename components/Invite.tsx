"use client";
import React, { useState } from "react";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { auth, db } from "@/lib/firebaseConfig";

export default function Invite() {
  const [email, setEmail] = useState("");
  const [groupId, setGroupId] = useState("");

  const handleInvite = async () => {
    const user = auth.currentUser;
    if (user && email && groupId) {
      const uidToInvite = await findUidByEmail(email);
      if (uidToInvite) {
        const groupRef = doc(db, "publicGroups", groupId);
        await updateDoc(groupRef, {
          participants: arrayUnion(uidToInvite),
        });
        setEmail("");
        setGroupId("");
      }
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Invite to Group</h1>
      <input
        type="text"
        className="mt-4 w-full p-2 border rounded"
        placeholder="Group ID"
        value={groupId}
        onChange={(e) => setGroupId(e.target.value)}
      />
      <input
        type="email"
        className="mt-4 w-full p-2 border rounded"
        placeholder="Email to invite"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        onClick={handleInvite}
      >
        Invite
      </button>
    </div>
  );
}

const findUidByEmail = async (email: string): Promise<string | null> => {
  return null;
};
