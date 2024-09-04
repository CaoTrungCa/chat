'use client'
import { useEffect, useState } from "react";
import { auth, loginWithGoogle, signOut } from "@/firebase/firebase";
import ChatRoom from "@/components/ChatRoom";
import PageContainer from "@/components/PageContainer";

export default function Home() {
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
    <div className="h-screen flex flex-col">
      {user ? (
        <>
          <nav className="w-full text-center border-b border-gray-300 pb-1 bg-white z-10">
            <h2 className="text-2xl font-semibold">Chat With Friends</h2>
            <button
              onClick={() => signOut()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg cursor-pointer hover:border hover:border-red-600 hover:bg-transparent hover:text-red-600"
            >
              Sign Out
            </button>
          </nav>
          <PageContainer>

          </PageContainer>
        </>
      ) : (
        <section className="h-screen flex flex-col items-center justify-center">
          <h1 className="text-3xl font-bold mb-4">Welcome to Chat Room</h1>
          <button
            onClick={() => loginWithGoogle()}
            className="p-5 cursor-pointer rounded-lg text-xl border hover:border hover:border-red-600 hover:bg-transparent hover:text-red-600"
          >
            Sign In With Google
          </button>
        </section>
      )}
    </div>
  );
}
