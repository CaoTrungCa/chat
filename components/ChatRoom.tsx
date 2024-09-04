"use client";
import { useEffect, useRef, useState } from "react";
import { formatRelative } from "date-fns";
import { db } from "@/firebase/firebase";
import { collection, query, orderBy, limit, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import Image from "next/image";

export default function ChatRoom({ user, id, type }: { user: any, id: any, type: any }) {
    const dummySpace = useRef<HTMLDivElement | null>(null);
    const { uid, displayName, photoURL } = user;

    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");

    if (!uid || !id) return;
    let chatId = "";

    if(type === 'individual') {
        chatId = [uid, id].sort().join('-');
    } else {
        chatId = id
    }

    useEffect(() => {
        const messagesCollection = collection(db, `messages/${type}/${chatId}`);
        const messagesQuery = query(messagesCollection, orderBy("createdAt"), limit(100));

        const unsubscribe = onSnapshot(messagesQuery, (querySnapShot) => {
            const data = querySnapShot.docs.map((doc) => ({
                ...doc.data(),
                id: doc.id,
            }));
            setMessages(data);
        });

        return () => unsubscribe();
    }, [db]);

    useEffect(() => {
        if (dummySpace.current) {
            dummySpace.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim()) {
            await addDoc(collection(db, `messages/${type}/${chatId}`), {
                text: newMessage,
                createdAt: serverTimestamp(),
                uid,
                displayName,
                photoURL,
            });
            setNewMessage("");
            if (dummySpace.current) {
                dummySpace.current.scrollIntoView({ behavior: "smooth" });
            }
        }
    };

    return (
        <>
            <div className="relative flex-grow flex flex-col">
                <div className="flex-grow flex flex-col">
                    <ul className="flex-grow overflow-y-auto pb-16 pt-4">
                        {messages.map((message) => (
                            <li
                                key={message.id}
                                className={`${
                                    message.uid === uid ? "flex flex-row-reverse mr-4" : "ml-4"
                                } flex gap-2 items-end`}
                            >
                                <div className="inline-block">
                                    {message.photoURL ? (
                                        <Image
                                            src={message.photoURL}
                                            alt="Avatar"
                                            width={35}
                                            height={35}
                                            className="rounded-lg mt-1 border border-blue-400"
                                        />
                                    ) : null}
                                </div>
                                <div className="inline-block max-w-96 bg-blue-100 p-2 rounded-lg mt-1">
                                    {message.displayName ? (
                                        <span className="block text-gray-500 font-bold text-sm text-left">
                                            {message.displayName}
                                        </span>
                                    ) : null}
                                    <p className="w-full break-words">{message.text}</p>
                                    <br />
                                    {message.createdAt?.seconds ? (
                                        <span className="block text-gray-500 text-xs text-right">
                                            {formatRelative(
                                                new Date(message.createdAt.seconds * 1000),
                                                new Date()
                                            )}
                                        </span>
                                    ) : null}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
                <div ref={dummySpace}></div>
                <div className="absolute bottom-0 left-0 w-full bg-white border-t border-gray-300">
                    <form
                        onSubmit={handleSubmit}
                        className="flex items-center p-2"
                    >
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type your message here..."
                            className="w-full h-10 mx-2 border-0 outline-none ring-0 hover:outline-none hover:ring-0 text-black"
                        />
                        <button
                            type="submit"
                            disabled={!newMessage.trim()}
                            className="px-4 h-11 hover:bg-transparent bg-blue-600 text-white hover:border hover:border-blue-600 hover:text-blue-600 rounded-lg hover:cursor-pointer"
                        >
                            Send
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}
