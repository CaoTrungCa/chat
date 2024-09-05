"use client";
import React, { useEffect, useState } from "react";
import ListUsers from "./ListAccounts";
import ListGroups from "./ListGroups";
import { auth } from "@/firebase/firebase";

interface PageContainerProps {
  className?: string;
  children?: React.ReactNode;
}

export default function PageContainer({ children }: PageContainerProps) {
    const [user, setUser] = useState(() => auth.currentUser);
  
    useEffect(() => {
        auth.onAuthStateChanged((user) => {
            if (user) {
                setUser(user);
            } else {
                setUser(null);
            }
        });
    }, []);

    return (
        <div className="flex h-screen">
            <div className="w-1/5 bg-gray-300 flex flex-col">
                <ListUsers user={user} />
                <ListGroups user={user} />
            </div>
            {children}
        </div>
    )
}
