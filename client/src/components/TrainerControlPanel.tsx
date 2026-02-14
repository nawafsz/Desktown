import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Users,
    Settings,
    BarChart3,
    MessageSquare,
    Hand,
    Share2,
    Maximize,
    Volume2,
    Wifi,
    Clock,
    TrendingUp,
    UserCheck,
    Activity,
} from "lucide-react";

interface EngagementMetrics {
    attentionSpan: number[];
    participationRate: number;
    raiseHandCount: number;
    chatActivity: number;
    averageViewTime: string;
}

interface TrainerControlPanelProps {
    viewerCount: number;
    isRecording: boolean;
    sessionDuration: string;
    onToggleRecording: () => void;
    onScreenShare: () => void;
    onOpenWhiteboard: () => void;
    onCreatePoll: () => void;
    onManageBreakout: () => void;
}

export default function TrainerControlPanel({
    viewerCount = 142,
    isRecording = true,
    sessionDuration = "00:45:22",
    onToggleRecording,
    onScreenShare,
    onOpenWhiteboard,
    onCreatePoll,
    onManageBreakout,
}: TrainerControlPanelProps) {
    const [showMetrics, setShowMetrics] = useState(true);
    const [connectionQuality, setConnectionQuality] = useState<"excellent" | "good" | "poor">("excellent");

    const metrics: EngagementMetrics = {
        attentionSpan: [85, 88, 82, 90, 87, 92, 89, 91],
        participationRate: 78,
        raiseHandCount: 3,
        chatActivity: 45,
        averageViewTime: "38:15",
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-black via-gray-900/95 to-transparent backdrop-blur-xl border-t border-white/10 p-2 md:p-4 z-50 max-h-[80vh] overflow-y-auto" dir="rtl">
            <div className="max-w-7xl mx-auto">
                {/* Metrics Panel (Collapsible) */}
                {showMetrics && (
                    <div className="mb-4 grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 animate-in slide-in-from-bottom-4 duration-300">
                        {/* Attention Span */}
                        <Card className="bg-gradient-to-br from-teal-500/10 to-teal-600/5 border-teal-500/30 backdrop-blur-md p-3 md:p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] md:text-xs text-gray-400 truncate">معدل الانتباه</span>
                                <Activity className="w-3 h-3 md:w-4 md:h-4 text-teal-400" />
                            </div>
                            <p className="text-2xl font-bold text-teal-400">
                                {Math.round(metrics.attentionSpan.reduce((a, b) => a + b) / metrics.attentionSpan.length)}%
                            </p>
                        </Card>

                        {/* Participation Rate */}
                        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/30 backdrop-blur-md p-3 md:p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] md:text-xs text-gray-400 truncate">معدل المشاركة</span>
                                <TrendingUp className="w-3 h-3 md:w-4 md:h-4 text-blue-400" />
                            </div>
                            <p className="text-xl md:text-2xl font-bold text-blue-400">{metrics.participationRate}%</p>
                        </Card>

                        {/* Raise Hand Notifications */}
                        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/30 backdrop-blur-md p-3 md:p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] md:text-xs text-gray-400 truncate">أيدي مرفوعة</span>
                                <Hand className="w-3 h-3 md:w-4 md:h-4 text-amber-400" />
                            </div>
                            <p className="text-xl md:text-2xl font-bold text-amber-400">
                                {metrics.raiseHandCount} {metrics.raiseHandCount === 1 ? 'شخص' : 'أشخاص'}
                            </p>
                        </Card>

                        {/* Chat Activity */}
                        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/30 backdrop-blur-md p-3 md:p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] md:text-xs text-gray-400 truncate">نشاط الدردشة</span>
                                <MessageSquare className="w-3 h-3 md:w-4 md:h-4 text-purple-400" />
                            </div>
                            <p className="text-xl md:text-2xl font-bold text-purple-400">{metrics.chatActivity} رسالة</p>
                        </Card>
                    </div>
                )}

                {/* Main Control Bar */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    {/* Left Section - Session Info */}
                    <div className="flex flex-wrap justify-center items-center gap-2 md:gap-4 w-full md:w-auto">
                        {/* Recording Status */}
                        <div className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl">
                            {isRecording && (
                                <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-red-500 animate-pulse shadow-lg shadow-red-500/50" />
                            )}
                            <span className="text-xs md:text-sm font-semibold text-white">
                                {isRecording ? 'جاري التسجيل' : 'متوقف'}
                            </span>
                            <span className="text-[10px] md:text-xs text-gray-400 hidden sm:inline">RECORDING</span>
                        </div>

                        {/* Session Duration */}
                        <div className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl">
                            <Clock className="w-3 h-3 md:w-4 md:h-4 text-teal-400" />
                            <span className="text-xs md:text-sm font-mono font-bold text-white">{sessionDuration}</span>
                        </div>

                        {/* Viewer Count */}
                        <div className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl">
                            <Users className="w-3 h-3 md:w-4 md:h-4 text-blue-400" />
                            <span className="text-xs md:text-sm font-bold text-white">{viewerCount}</span>
                            <span className="text-[10px] md:text-xs text-gray-400 hidden sm:inline">مشاهد</span>
                        </div>

                        {/* Connection Quality */}
                        <div className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl">
                            <Wifi className={`w-3 h-3 md:w-4 md:h-4 ${connectionQuality === 'excellent' ? 'text-green-400' :
                                    connectionQuality === 'good' ? 'text-yellow-400' : 'text-red-400'
                                }`} />
                            <span className="text-[10px] md:text-xs text-gray-400">
                                {connectionQuality === 'excellent' ? 'ممتاز' : connectionQuality === 'good' ? 'جيد' : 'ضعيف'}
                            </span>
                        </div>
                    </div>

                    {/* Center Section - Main Controls */}
                    <div className="flex flex-wrap justify-center items-center gap-2 md:gap-3 w-full md:w-auto">
                        <ControlButton
                            icon="🎥"
                            label="تسجيل"
                            sublabel="Record"
                            active={isRecording}
                            onClick={onToggleRecording}
                            variant={isRecording ? "danger" : "default"}
                        />
                        <ControlButton
                            icon="🖥️"
                            label="مشاركة الشاشة"
                            sublabel="Screen Share"
                            onClick={onScreenShare}
                        />
                        <ControlButton
                            icon="✏️"
                            label="السبورة"
                            sublabel="Whiteboard"
                            onClick={onOpenWhiteboard}
                        />
                        <ControlButton
                            icon="📊"
                            label="استطلاع"
                            sublabel="Poll"
                            onClick={onCreatePoll}
                        />
                        <ControlButton
                            icon="👥"
                            label="غرف فرعية"
                            sublabel="Breakout"
                            onClick={onManageBreakout}
                        />
                    </div>

                    {/* Right Section - Settings */}
                    <div className="flex items-center gap-2 md:gap-3">
                        <button
                            onClick={() => setShowMetrics(!showMetrics)}
                            className="p-2 md:p-3 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all hover:scale-105"
                            title="Toggle Metrics"
                        >
                            <BarChart3 className="w-4 h-4 md:w-5 md:h-5 text-teal-400" />
                        </button>
                        <button
                            className="p-2 md:p-3 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all hover:scale-105"
                            title="Settings"
                        >
                            <Settings className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

interface ControlButtonProps {
    icon: string;
    label: string;
    sublabel: string;
    active?: boolean;
    variant?: "default" | "danger";
    onClick?: () => void;
}

function ControlButton({ icon, label, sublabel, active, variant = "default", onClick }: ControlButtonProps) {
    return (
        <button
            onClick={onClick}
            className={`group relative px-4 py-2 md:px-6 md:py-3 rounded-xl backdrop-blur-md border transition-all duration-300 hover:scale-105 flex-1 md:flex-none ${active
                    ? variant === "danger"
                        ? "bg-red-500/20 border-red-500/50 shadow-lg shadow-red-500/30"
                        : "bg-teal-500/20 border-teal-500/50 shadow-lg shadow-teal-500/30"
                    : "bg-white/5 border-white/10 hover:bg-white/10"
                }`}
        >
            <div className="flex flex-col items-center gap-1">
                <span className="text-xl md:text-2xl">{icon}</span>
                <span className="text-[10px] md:text-xs font-semibold text-white hidden sm:inline">{label}</span>
                <span className="text-[8px] md:text-[10px] text-gray-400 hidden sm:inline">{sublabel}</span>
            </div>

            {/* Glow Effect on Hover */}
            <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${variant === "danger" ? "bg-red-500/10" : "bg-teal-500/10"
                }`} />
        </button>
    );
}
