"use client";

import {usePathname, useRouter} from "next/navigation";
import ConversationsPage from "@/components/conversations-page";
import ContactsPage from "@/components/contacts-page";
import {useEffect} from "react";


const ChatPage = () => {
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        if (pathname === "/chat") {
            router.push("/chat/conversations");
        }
    }, [pathname, router]);


    return (
        <div className="flex flex-col h-screen">
            <div className="flex-1 overflow-hidden">
                {pathname === "/chat/conversations" && <ConversationsPage/>}
                {pathname === "/chat/contacts" && <ContactsPage/>}
            </div>
        </div>
    );
};

export default ChatPage;
