"use client";
import React, { useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebaseConfig";

export default function CreateGroup() {
  const [groupName, setGroupName] = useState("");

  const slugifyVietnamese = (text: string) => {
    if (text.includes("-")) {
      return text;
    }
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[đĐ]/g, "d")
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .replace(/\s+/g, "-")
      .replace(/--+/g, "-")
      .replace(/^-+/, "")
      .replace(/-+$/, "");
  };

  const handleCreateGroup = async () => {
    const user = auth.currentUser;
    if (user && groupName) {
      const timestamp = Date.now();
      const slug = `${slugifyVietnamese(groupName)}-${timestamp}`;
      const groupData = {
        groupName: groupName,
        id: slug,
        createdUid: user.uid,
        participants: [user.uid],
      };
      await setDoc(doc(db, "publicGroups", slug), groupData);
      setGroupName("");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Create a New Group</h1>
      <input
        type="text"
        className="mt-4 w-full p-2 border rounded"
        placeholder="Group Name"
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
      />
      <button
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        onClick={handleCreateGroup}
      >
        Create Group
      </button>
    </div>
  );
}
