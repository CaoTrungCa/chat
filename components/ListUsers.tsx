"use client";
import { useEffect, useState } from "react";
import { db } from "@/firebase/firebase";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import Image from "next/image";

export default function ListUsers() {
    const [users, setUsers] = useState<any[]>([]);

    useEffect(() => {
        const usersCollection = collection(db, "accounts");
        const usersQuery = query(usersCollection, orderBy("displayName"), limit(100));

        const unsubscribe = onSnapshot(usersQuery, (querySnapShot) => {
            const data = querySnapShot.docs.map((doc) => ({
                ...doc.data(),
                id: doc.id,
            }));
            setUsers(data);
        });

        return () => unsubscribe();
    }, [db]);

    console.log(users)

    return (
        <>
            <ul className="flex-grow flex flex-col">
                {users.map((u) => (
                    <li key={u.uid} className="flex gap-2 border-b-2 mx-2 py-2">
                        <Image alt={u.displayName} src={u.photoURL} width={30} height={30} className="rounded-lg shadow-md"/>
                        {u.displayName}
                    </li>
                ))}
            </ul>
        </>
    )
}