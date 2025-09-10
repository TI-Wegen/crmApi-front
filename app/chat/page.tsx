"use client";

import {useRouter, usePathname} from "next/navigation";
import {MessageCircle, Users} from "lucide-react";
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
            <div className="flex border-b border-gray-200 bg-white">
                <button
                    onClick={() => router.push("/chat/conversations")}
                    className={`flex items-center justify-center py-3 px-4 text-sm font-medium transition-colors ${
                        pathname === "/chat/conversations"
                            ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                >
                    <MessageCircle className="h-4 w-4 mr-2"/>
                    Conversations
                </button>
                <button
                    onClick={() => router.push("/chat/contacts")}
                    className={`flex items-center justify-center py-3 px-4 text-sm font-medium transition-colors ${
                        pathname === "/chat/contacts"
                            ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                >
                    <Users className="h-4 w-4 mr-2"/>
                    Contacts
                </button>
            </div>

            <div className="flex-1 overflow-hidden">
                {pathname === "/chat/conversations" && <ConversationsPage/>}
                {pathname === "/chat/contacts" && <ContactsPage/>}
            </div>
        </div>
    );
};

export default ChatPage;
