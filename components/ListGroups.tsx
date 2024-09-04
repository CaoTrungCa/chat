"use client";
import { useEffect, useState } from "react";
import { db } from "@/firebase/firebase";
import { collection, query, orderBy, limit, onSnapshot, addDoc } from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";

export default function ListGroups() {
    const [groups, setGroups] = useState<any[]>([]);
    const [isShow, setIsShow] = useState(false);
    const [newGroupName, setNewGroupName] = useState("");

    const slugifyVietnamese = (text: string) => {
        if (text.includes('-')) {
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

    useEffect(() => {
        const groupsCollection = collection(db, "groups");
        const groupsQuery = query(
            groupsCollection,
            orderBy("displayName"),
            limit(100)
        );

        const unsubscribe = onSnapshot(groupsQuery, (querySnapShot) => {
            const data = querySnapShot.docs.map((doc) => ({
                ...doc.data()
            }));
            setGroups(data);
        });

        return () => unsubscribe();
    }, [db]);

    const handleSaveGroup = async () => {
        if (newGroupName.trim()) {
            const timestamp = Date.now();
            const slug = `${slugifyVietnamese(newGroupName)}-${timestamp}`;
            const groupData = {
                displayName: newGroupName,
                photoURL: '',
                uid: slug,
                id: slug
            };

            await addDoc(collection(db, "groups"), groupData);
            setNewGroupName("");
            setIsShow(false);
        }
    };

    return (
        <>
            <div className="flex justify-between mx-2 pt-2 border-dashed border-b-2 border-white">
                <span className="font-bold">Groups</span>
                <div onClick={() => setIsShow(true)} className="text-sm cursor-pointer">
                    New
                </div>
            </div>
            <ul className="flex-grow flex flex-col">
                {groups.map((g) => (
                    <li key={g.uid} className="border-b-2 mx-2 py-2">
                        <Link href={`/messages/group/${g.uid}`} className="flex gap-2">
                            <Image alt={g.displayName} src={g.photoURL} width={30} height={30} className="rounded-lg shadow-md"/>
                            {g.displayName}
                        </Link>
                    </li>
                ))}
                {isShow && (
                    <li className="mx-2 py-2">
                        <input 
                            type="text" 
                            className="w-full border rounded-sm outline-none ring-0 hover:outline-none hover:ring-0 p-2"
                            value={newGroupName}
                            onChange={(e) => setNewGroupName(e.target.value)}
                            placeholder="Enter group name"
                        />
                        <button 
                            onClick={handleSaveGroup} 
                            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Save
                        </button>
                    </li>
                )}
            </ul>
        </>
    )
}