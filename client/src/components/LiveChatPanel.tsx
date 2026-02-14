import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Send,
    Image as ImageIcon,
    Smile,
    Pin,
    Trash2,
    MoreVertical,
    Search,
    X,
    Volume2,
    VolumeX,
    Filter,
    Users,
    MessageCircle,
} from "lucide-react";

export interface ChatMessage {
    id: string;
    sender: {
        name: string;
        avatar: string;
        role: "trainer" | "participant";
    };
    content: {
        text?: string;
        imageUrl?: string;
    };
    timestamp: Date;
    isPinned?: boolean;
    isAnnouncement?: boolean;
    reactions?: { emoji: string; count: number }[];
}

interface LiveChatPanelProps {
    isTrainer?: boolean;
    currentUserId: string;
    messages: ChatMessage[];
    onSendMessage: (message: string, imageUrl?: string) => void;
    onPinMessage?: (messageId: string) => void;
    onDeleteMessage?: (messageId: string) => void;
    onMuteParticipant?: (userId: string) => void;
}

export default function LiveChatPanel({
    isTrainer = false,
    currentUserId = "user-1",
    messages,
    onSendMessage,
    onPinMessage,
    onDeleteMessage,
    onMuteParticipant,
}: LiveChatPanelProps) {
    const [newMessage, setNewMessage] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [showSearch, setShowSearch] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [typingUsers, setTypingUsers] = useState<string[]>([]);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    const emojis = ["😊", "👍", "❤️", "🎉", "👏", "🔥", "💡", "✅", "❓", "⭐"];

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleSendMessage = () => {
        if (!newMessage.trim() && !selectedImage) return;

        onSendMessage(newMessage, selectedImage || undefined);
        setNewMessage("");
        setSelectedImage(null);
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            setSelectedImage(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handlePinMessage = (messageId: string) => {
        if (!isTrainer) return;
        onPinMessage?.(messageId);
    };

    const handleDeleteMessage = (messageId: string) => {
        if (!isTrainer) return;
        onDeleteMessage?.(messageId);
    };

    const filteredMessages = messages.filter(msg =>
        msg.content.text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.sender.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const pinnedMessages = messages.filter(msg => msg.isPinned);

    return (
        <div className="h-full flex flex-col bg-gradient-to-b from-gray-900 to-gray-800 border-r border-white/10" dir="rtl">
            {/* Header */}
            <div className="flex-shrink-0 bg-gradient-to-r from-teal-500/10 to-blue-500/10 backdrop-blur-md border-b border-white/10 p-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center shadow-lg shadow-teal-500/30">
                            <MessageCircle className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">الدردشة المباشرة</h2>
                            <p className="text-xs text-gray-400">Live Chat</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowSearch(!showSearch)}
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                        >
                            <Search className="w-4 h-4 text-gray-400" />
                        </button>
                        <button
                            onClick={() => setIsMuted(!isMuted)}
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                        >
                            {isMuted ? (
                                <VolumeX className="w-4 h-4 text-red-400" />
                            ) : (
                                <Volume2 className="w-4 h-4 text-teal-400" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                {showSearch && (
                    <div className="relative animate-in slide-in-from-top-2 duration-200">
                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="بحث في الرسائل... / Search messages..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pr-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 text-sm h-9"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute left-3 top-1/2 transform -translate-y-1/2"
                            >
                                <X className="w-4 h-4 text-gray-400 hover:text-white" />
                            </button>
                        )}
                    </div>
                )}

                {/* Participant Count */}
                <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
                    <Users className="w-4 h-4" />
                    <span>142 مشارك نشط / Active participants</span>
                </div>
            </div>

            {/* Pinned Messages */}
            {pinnedMessages.length > 0 && (
                <div className="flex-shrink-0 bg-amber-500/10 border-b border-amber-500/20 p-3">
                    {pinnedMessages.map(msg => (
                        <div key={msg.id} className="flex items-start gap-2 text-sm">
                            <Pin className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                                <span className="font-semibold text-amber-400">{msg.sender.name}:</span>
                                <span className="text-gray-300 ml-2 line-clamp-2">{msg.content.text}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Messages Area */}
            <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
            >
                {filteredMessages.map((message) => (
                    <ChatMessageItem
                        key={message.id}
                        message={message}
                        isTrainer={isTrainer}
                        onPin={() => handlePinMessage(message.id)}
                        onDelete={() => handleDeleteMessage(message.id)}
                    />
                ))}

                {/* Typing Indicator */}
                {typingUsers.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-gray-400 animate-pulse">
                        <div className="flex gap-1">
                            <div className="w-2 h-2 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        <span>{typingUsers.join(", ")} يكتب... / typing...</span>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Image Preview */}
            {selectedImage && (
                <div className="flex-shrink-0 p-3 bg-white/5 border-t border-white/10">
                    <div className="relative inline-block">
                        <img
                            src={selectedImage}
                            alt="Preview"
                            className="max-h-32 rounded-lg border border-white/20"
                        />
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            )}

            {/* Emoji Picker */}
            {showEmojiPicker && (
                <div className="flex-shrink-0 p-3 bg-white/5 border-t border-white/10">
                    <div className="grid grid-cols-10 gap-2">
                        {emojis.map((emoji) => (
                            <button
                                key={emoji}
                                onClick={() => {
                                    setNewMessage(newMessage + emoji);
                                    setShowEmojiPicker(false);
                                }}
                                className="text-2xl hover:scale-125 transition-transform"
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Input Area */}
            <div className="flex-shrink-0 p-4 bg-gradient-to-t from-gray-900 to-gray-800 border-t border-white/10">
                <input
                    type="file"
                    ref={imageInputRef}
                    onChange={handleImageSelect}
                    accept="image/*"
                    className="hidden"
                />

                <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-teal-500 focus-within:border-transparent transition-all">
                    <button
                        onClick={() => imageInputRef.current?.click()}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                    >
                        <ImageIcon className="w-5 h-5 text-gray-400" />
                    </button>

                    <button
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                    >
                        <Smile className="w-5 h-5 text-gray-400" />
                    </button>

                    <Input
                        type="text"
                        placeholder="اكتب رسالة... / Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                        className="flex-1 bg-transparent border-none shadow-none focus-visible:ring-0 h-8 p-0 text-white placeholder:text-gray-500 text-sm"
                    />

                    <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() && !selectedImage}
                        className="p-2 rounded-lg bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 shadow-lg shadow-teal-500/30"
                    >
                        <Send className="w-5 h-5 text-white rotate-180" />
                    </button>
                </div>

                {isTrainer && (
                    <div className="mt-2 text-xs text-gray-500 text-center">
                        لديك صلاحيات المدرب: تثبيت وحذف الرسائل / Trainer privileges: Pin & delete messages
                    </div>
                )}
            </div>
        </div>
    );
}

interface ChatMessageItemProps {
    message: ChatMessage;
    isTrainer: boolean;
    onPin: () => void;
    onDelete: () => void;
}

function ChatMessageItem({ message, isTrainer, onPin, onDelete }: ChatMessageItemProps) {
    const [showActions, setShowActions] = useState(false);

    return (
        <div
            className={`group flex gap-3 animate-in slide-in-from-bottom-2 duration-300 ${message.isAnnouncement ? "bg-teal-500/10 border border-teal-500/20 rounded-xl p-3 -mx-2" : ""
                }`}
            onMouseEnter={() => setShowActions(true)}
            onMouseLeave={() => setShowActions(false)}
        >
            {/* Avatar */}
            <div className="flex-shrink-0">
                <div className={`w-10 h-10 rounded-full overflow-hidden border-2 ${message.sender.role === "trainer" ? "border-teal-500" : "border-white/20"
                    }`}>
                    <img src={message.sender.avatar} alt={message.sender.name} className="w-full h-full object-cover" />
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                {/* Header */}
                <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm text-white">{message.sender.name}</span>
                    {message.sender.role === "trainer" && (
                        <Badge className="bg-teal-500/20 text-teal-400 border-teal-500/30 text-xs px-2 py-0">
                            مدرب / Trainer
                        </Badge>
                    )}
                    <span className="text-xs text-gray-500">
                        {message.timestamp.toLocaleTimeString("ar-SA", {
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    </span>
                </div>

                {/* Message Content */}
                {message.content.text && (
                    <p className="text-sm text-gray-200 whitespace-pre-line leading-relaxed">
                        {message.content.text}
                    </p>
                )}

                {message.content.imageUrl && (
                    <img
                        src={message.content.imageUrl}
                        alt="Shared image"
                        className="mt-2 max-w-xs rounded-lg border border-white/20 cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => window.open(message.content.imageUrl, "_blank")}
                    />
                )}

                {/* Reactions */}
                {message.reactions && message.reactions.length > 0 && (
                    <div className="flex items-center gap-2 mt-2">
                        {message.reactions.map((reaction, i) => (
                            <button
                                key={i}
                                className="flex items-center gap-1 px-2 py-1 bg-white/5 hover:bg-white/10 rounded-full text-xs transition-colors"
                            >
                                <span>{reaction.emoji}</span>
                                <span className="text-gray-400">{reaction.count}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Actions (Trainer Only) */}
            {isTrainer && showActions && (
                <div className="flex-shrink-0 flex items-start gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={onPin}
                        className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                        title="Pin message"
                    >
                        <Pin className={`w-4 h-4 ${message.isPinned ? "text-amber-400" : "text-gray-400"}`} />
                    </button>
                    <button
                        onClick={onDelete}
                        className="p-1.5 rounded-lg hover:bg-red-500/20 transition-colors"
                        title="Delete message"
                    >
                        <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                </div>
            )}
        </div>
    );
}
