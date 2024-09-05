"use client";
import { useEffect, useState } from "react";
import { db } from "@/firebase/firebase";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";

export default function ListAccounts({user}: {user: any}) {
    const [accounts, setAccounts] = useState<any[]>([]);

    useEffect(() => {
        const accountsCollection = collection(db, "accounts");
        const accountsQuery = query(
            accountsCollection,
            orderBy("displayName"),
            limit(100)
        );

        const unsubscribe = onSnapshot(accountsQuery, (querySnapShot) => {
            const data = querySnapShot.docs.map((doc) => ({
                ...doc.data()
            })).filter((u) => u.uid != user.uid);
            setAccounts(data);
        });

        return () => unsubscribe();
    }, [db]);

    return (
        <div>
            <div className="mx-2 pt-2 font-bold border-dashed border-b-2 border-white">
                <span>Users</span>
            </div>
            <ul className="flex-grow flex flex-col">
                {accounts.map((u) => (
                    <li key={u.uid} className="border-b-2 mx-2 py-2">
                        <Link href={`/messages/individual/${u.uid}`} className="flex gap-2">
                            <Image alt={u.displayName} src={u.photoURL} width={30} height={30} className="rounded-lg shadow-md"/>
                            {u.displayName}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    )
}