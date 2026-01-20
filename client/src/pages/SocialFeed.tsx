import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatar } from "@/components/UserAvatar";
import { ObjectUploader } from "@/components/ObjectUploader";
import { Send, Image, Video, X, Building2, Heart, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { SocialPostCard } from "@/components/SocialPostCard";
import type { Post, User, Office, OfficePost } from "@shared/schema";
import { useLanguage, translations } from "@/lib/i18n";

export default function SocialFeed() {
  const { language } = useLanguage();
  const t = translations[language];
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [newPostContent, setNewPostContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);
  const [officePostContent, setOfficePostContent] = useState("");
  const [officeMediaUrl, setOfficeMediaUrl] = useState<string | null>(null);
  const [officeMediaType, setOfficeMediaType] = useState<"image" | "video" | null>(null);

  const { data: posts = [], isLoading: postsLoading } = useQuery<Post[]>({
    queryKey: ["/api/posts"],
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const createPostMutation = useMutation({
    mutationFn: async (data: { content: string; mediaUrl?: string; mediaType?: string }) => {
      return await apiRequest("POST", "/api/posts", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      setNewPostContent("");
      setMediaUrl(null);
      setMediaType(null);
      toast({ title: t.socialFeed?.posted || "Posted!", description: t.socialFeed?.postedDesc || "Your update has been shared." });
    },
    onError: () => {
      toast({ title: t.socialFeed?.error || "Error", description: t.socialFeed?.failedPost || "Failed to create post.", variant: "destructive" });
    },
  });

  const { data: officePosts = [], isLoading: officePostsLoading } = useQuery<OfficePost[]>({
    queryKey: ["/api/public/posts"],
  });

  const isOfficeManagerOrAdmin = currentUser?.role === "manager" || currentUser?.role === "admin";

  const { data: myOffices = [] } = useQuery<Office[]>({
    queryKey: ["/api/offices"],
    enabled: isOfficeManagerOrAdmin,
  });

  const { data: publicOffices = [] } = useQuery<Office[]>({
    queryKey: ["/api/public/offices"],
  });

  const primaryOffice = myOffices[0];

  const createOfficePostMutation = useMutation({
    mutationFn: async (data: { officeId: number; content: string; mediaUrl?: string; mediaType?: string }) => {
      const { officeId, ...body } = data;
      return await apiRequest("POST", `/api/offices/${officeId}/posts`, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/public/posts"] });
      setOfficePostContent("");
      setOfficeMediaUrl(null);
      setOfficeMediaType(null);
      toast({
        title: language === "ar" ? "تم نشر منشور المكتب" : "Office post published",
        description: language === "ar" ? "تمت مشاركة تحديث مكتبك مع الزوار." : "Your office update has been shared.",
      });
    },
    onError: () => {
      toast({
        title: t.socialFeed?.error || "Error",
        description: language === "ar" ? "فشل في إنشاء منشور المكتب." : "Failed to create office post.",
        variant: "destructive",
      });
    },
  });

  const handlePost = () => {
    if (newPostContent.trim() || mediaUrl) {
      createPostMutation.mutate({
        content: newPostContent || "",
        mediaUrl: mediaUrl || undefined,
        mediaType: mediaType || undefined,
      });
    }
  };

  const handleOfficePost = () => {
    if (!primaryOffice) return;
    if (!officePostContent.trim() && !officeMediaUrl) return;
    createOfficePostMutation.mutate({
      officeId: primaryOffice.id,
      content: officePostContent || "",
      mediaUrl: officeMediaUrl || undefined,
      mediaType: officeMediaType || undefined,
    });
  };

  const handleMediaUploadComplete = async (result: any, type: "image" | "video") => {
    if (result.successful && result.successful.length > 0) {
      const uploadedUrl = result.successful[0].uploadURL;
      try {
        const response = await apiRequest("PUT", "/api/media", { mediaURL: uploadedUrl });
        const data = await response.json();
        setMediaUrl(data.objectPath);
        setMediaType(type);
        const typeLabel = type === "image" ? (t.socialFeed?.photo || "Photo") : (t.socialFeed?.video || "Video");
        toast({ title: t.socialFeed?.uploaded || "Uploaded!", description: `${typeLabel} ${t.socialFeed?.readyToPost || "ready to post."}` });
      } catch (error) {
        toast({ title: t.socialFeed?.uploadFailed || "Upload Failed", description: t.socialFeed?.uploadFailedDesc || "Could not process the uploaded file. Please try again.", variant: "destructive" });
      }
    }
  };

  const handleOfficeMediaUploadComplete = async (result: any, type: "image" | "video") => {
    if (result.successful && result.successful.length > 0) {
      const uploadedUrl = result.successful[0].uploadURL;
      try {
        const response = await apiRequest("PUT", "/api/media", { mediaURL: uploadedUrl });
        const data = await response.json();
        setOfficeMediaUrl(data.objectPath);
        setOfficeMediaType(type);
        const typeLabel = type === "image" ? (t.socialFeed?.photo || "Photo") : (t.socialFeed?.video || "Video");
        toast({
          title: t.socialFeed?.uploaded || "Uploaded!",
          description: `${typeLabel} ${t.socialFeed?.readyToPost || "ready to post."}`,
        });
      } catch {
        toast({
          title: t.socialFeed?.uploadFailed || "Upload Failed",
          description: t.socialFeed?.uploadFailedDesc || "Could not process the uploaded file. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const getUploadParams = async () => {
    const response = await apiRequest("POST", "/api/objects/upload");
    const data = await response.json();
    return { method: "PUT" as const, url: data.uploadURL };
  };

  const getUserById = (userId: string | null) => {
    if (!userId) return null;
    return users.find(u => u.id === userId);
  };

  const currentUserName = currentUser 
    ? `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || currentUser.email || (t.common?.you || 'You')
    : (t.common?.you || 'You');

  const clearMedia = () => {
    setMediaUrl(null);
    setMediaType(null);
  };

  const clearOfficeMedia = () => {
    setOfficeMediaUrl(null);
    setOfficeMediaType(null);
  };

  const featuredOffices = publicOffices.slice(0, 4);

  return (
    <div className="p-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-semibold">{t.socialFeed?.title || "Social Feed"}</h1>
          <p className="text-muted-foreground mt-1">
            {t.socialFeed?.subtitle || "Share updates, photos, and videos with your team"}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.1fr)]">
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <UserAvatar
                    name={currentUserName}
                    avatar={currentUser?.profileImageUrl}
                    size="md"
                  />
                  <div className="flex-1 space-y-3">
                    <Textarea
                      placeholder={t.socialFeed?.whatsOnMind || "What's on your mind?"}
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      className="resize-none min-h-[80px]"
                      data-testid="input-post-content"
                    />

                    {mediaUrl && (
                      <div className="relative rounded-lg overflow-hidden bg-muted">
                        <Button
                          variant="secondary"
                          size="icon"
                          className="absolute top-2 right-2 z-10 h-8 w-8"
                          onClick={clearMedia}
                          data-testid="button-remove-media"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        {mediaType === "image" ? (
                          <img
                            src={mediaUrl}
                            alt={t.socialFeed?.uploadPreview || "Upload preview"}
                            className="max-h-64 w-full object-contain"
                          />
                        ) : (
                          <video
                            src={mediaUrl}
                            controls
                            className="max-h-64 w-full"
                          />
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex gap-2">
                        <ObjectUploader
                          maxNumberOfFiles={1}
                          maxFileSize={10485760}
                          allowedFileTypes={["image/*"]}
                          onGetUploadParameters={getUploadParams}
                          onComplete={(result) => handleMediaUploadComplete(result, "image")}
                          buttonVariant="ghost"
                          buttonSize="sm"
                        >
                          <Image className={`h-4 w-4 ${language === 'ar' ? 'ml-1' : 'mr-1'}`} />
                          {t.socialFeed?.photo || "Photo"}
                        </ObjectUploader>
                        <ObjectUploader
                          maxNumberOfFiles={1}
                          maxFileSize={52428800}
                          allowedFileTypes={["video/*"]}
                          onGetUploadParameters={getUploadParams}
                          onComplete={(result) => handleMediaUploadComplete(result, "video")}
                          buttonVariant="ghost"
                          buttonSize="sm"
                        >
                          <Video className={`h-4 w-4 ${language === 'ar' ? 'ml-1' : 'mr-1'}`} />
                          {t.socialFeed?.video || "Video"}
                        </ObjectUploader>
                      </div>
                      <Button
                        onClick={handlePost}
                        disabled={(!newPostContent.trim() && !mediaUrl) || createPostMutation.isPending}
                        data-testid="button-post"
                      >
                        <Send className={`h-4 w-4 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                        {createPostMutation.isPending
                          ? (t.socialFeed?.posting || "Posting...")
                          : (t.socialFeed?.post || "Post")}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-sm">
                      {language === "ar" ? "آخر الأخبار من المكاتب" : "Latest Office News"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {language === "ar"
                        ? "صور وأخبار وعروض من المكاتب المختلفة"
                        : "Photos, news and offers from different offices"}
                    </div>
                  </div>
                </div>

                {officePostsLoading ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    {Array(4)
                      .fill(0)
                      .map((_, i) => (
                        <Skeleton key={i} className="h-40 w-full" />
                      ))}
                  </div>
                ) : officePosts.length > 0 ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    {officePosts.map((post) => (
                      <OfficePostCard key={post.id} post={post} language={language} />
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground text-center py-8">
                    {language === "ar"
                      ? "لا توجد أخبار مكاتب حتى الآن."
                      : "No office news posts yet."}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            {(isOfficeManagerOrAdmin && primaryOffice) && (
              <Card>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-semibold text-sm">
                        {language === "ar" ? "ركن أصحاب المكاتب" : "Office Owners Corner"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {language === "ar"
                          ? `شارك منشورات مكتبك وآرائك مع الزوار`
                          : "Share your office updates and opinions with visitors"}
                      </div>
                    </div>
                  </div>

                  <Textarea
                    placeholder={
                      language === "ar"
                        ? "ما هي آخر الأخبار أو العروض في مكتبك؟"
                        : "What is the latest news or offer from your office?"
                    }
                    value={officePostContent}
                    onChange={(e) => setOfficePostContent(e.target.value)}
                    className="resize-none min-h-[70px]"
                  />

                  {officeMediaUrl && (
                    <div className="relative rounded-lg overflow-hidden bg-muted">
                      <Button
                        variant="secondary"
                        size="icon"
                        className="absolute top-2 right-2 z-10 h-8 w-8"
                        onClick={clearOfficeMedia}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      {officeMediaType === "image" ? (
                        <img
                          src={officeMediaUrl}
                          alt={t.socialFeed?.uploadPreview || "Upload preview"}
                          className="max-h-48 w-full object-contain"
                        />
                      ) : (
                        <video
                          src={officeMediaUrl}
                          controls
                          className="max-h-48 w-full"
                        />
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex gap-2">
                      <ObjectUploader
                        maxNumberOfFiles={1}
                        maxFileSize={10485760}
                        allowedFileTypes={["image/*"]}
                        onGetUploadParameters={getUploadParams}
                        onComplete={(result) => handleOfficeMediaUploadComplete(result, "image")}
                        buttonVariant="ghost"
                        buttonSize="sm"
                      >
                        <Image className={`h-4 w-4 ${language === 'ar' ? 'ml-1' : 'mr-1'}`} />
                        {t.socialFeed?.photo || "Photo"}
                      </ObjectUploader>
                      <ObjectUploader
                        maxNumberOfFiles={1}
                        maxFileSize={52428800}
                        allowedFileTypes={["video/*"]}
                        onGetUploadParameters={getUploadParams}
                        onComplete={(result) => handleOfficeMediaUploadComplete(result, "video")}
                        buttonVariant="ghost"
                        buttonSize="sm"
                      >
                        <Video className={`h-4 w-4 ${language === 'ar' ? 'ml-1' : 'mr-1'}`} />
                        {t.socialFeed?.video || "Video"}
                      </ObjectUploader>
                    </div>
                    <Button
                      onClick={handleOfficePost}
                      disabled={
                        (!officePostContent.trim() && !officeMediaUrl) ||
                        createOfficePostMutation.isPending
                      }
                    >
                      <Send className={`h-4 w-4 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                      {createOfficePostMutation.isPending
                        ? (language === "ar" ? "جاري النشر..." : "Posting...")
                        : (language === "ar" ? "نشر للمكتب" : "Post for office")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-sm">
                      {t.welcome?.featuredOffices || (language === "ar" ? "المكاتب المميزة" : "Featured Offices")}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {t.welcome?.discoverOffices ||
                        (language === "ar"
                          ? "اكتشف مساحات المكاتب الافتراضية المميزة"
                          : "Discover highlighted virtual offices")}
                    </div>
                  </div>
                </div>

                {featuredOffices.length > 0 ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {featuredOffices.map((office) => (
                      <div
                        key={office.id}
                        className="flex items-start gap-2 rounded-md border px-2 py-2"
                      >
                        <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Building2 className="h-4 w-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-semibold truncate">
                            {office.name}
                          </div>
                          {office.location && (
                            <div className="text-[11px] text-muted-foreground truncate">
                              {office.location}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground">
                    {t.welcome?.noOffices ||
                      (language === "ar"
                        ? "لا توجد مكاتب متاحة حالياً"
                        : "No offices available right now")}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {!postsLoading && posts.length > 0 && (
          <div className="mt-10 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {language === "ar" ? "تحديثات الفريق الداخلية" : "Internal Team Updates"}
              </h2>
            </div>
            <div className="space-y-4">
              {posts.map((post) => {
                const author = getUserById(post.authorId);
                return (
                  <SocialPostCard
                    key={post.id}
                    post={post}
                    author={author}
                    currentUserId={currentUser?.id}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function OfficePostCard({ post, language }: { post: OfficePost; language: string }) {
  const [likes, setLikes] = useState(post.likes ?? 0);
  const [isLiking, setIsLiking] = useState(false);

  const handleLike = async () => {
    try {
      setIsLiking(true);
      await apiRequest("POST", `/api/public/posts/${post.id}/like`);
      setLikes((prev) => prev + 1);
    } catch {
    } finally {
      setIsLiking(false);
    }
  };

  const hasMedia = !!post.mediaUrl && !!post.mediaType;
  const createdAt = post.createdAt ? new Date(post.createdAt as any) : null;

  return (
    <Card className="overflow-hidden">
      {hasMedia && (
        <div className="relative">
          {post.mediaType === "image" ? (
            <img
              src={post.mediaUrl || ""}
              alt="Office media"
              className="h-40 w-full object-cover"
            />
          ) : (
            <video
              src={post.mediaUrl || ""}
              controls
              className="h-40 w-full object-cover"
            />
          )}
        </div>
      )}
      <CardContent className="p-3 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center">
              <Building2 className="h-4 w-4 text-primary" />
            </div>
            <span className="text-xs font-medium">
              {language === "ar" ? "منشور مكتب" : "Office post"}
            </span>
          </div>
          <span className="text-[11px] text-muted-foreground">
            {createdAt
              ? createdAt.toLocaleString(language === "ar" ? "ar-SA" : "en-US", {
                  month: "short",
                  day: "numeric",
                })
              : ""}
          </span>
        </div>

        {post.content && (
          <p className="text-xs leading-relaxed line-clamp-3">{post.content}</p>
        )}

        <div className="flex items-center justify-between pt-1">
          <Button
            variant="ghost"
            size="sm"
            className={`h-7 px-2 gap-1 text-xs ${likes > 0 ? "text-red-500" : ""}`}
            onClick={handleLike}
            disabled={isLiking}
          >
            <Heart className={`h-3 w-3 ${likes > 0 ? "fill-current" : ""}`} />
            <span>{likes}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs gap-1"
          >
            <Share2 className="h-3 w-3" />
            <span>{language === "ar" ? "مشاركة" : "Share"}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
