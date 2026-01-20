import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { UserAvatar } from "@/components/UserAvatar";
import { ObjectUploader } from "@/components/ObjectUploader";
import { 
  Send, Image, Video, X, Heart, Users, Play, Camera,
  MapPin, Globe, Edit2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { SocialPostCard } from "@/components/SocialPostCard";
import type { Post, User } from "@shared/schema";

interface Profile {
  id: number;
  ownerId: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  coverUrl: string | null;
  website: string | null;
  location: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface ProfileStats {
  likes: number;
  followers: number;
  videos: number;
  photos: number;
}

export default function Profile() {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [newPostContent, setNewPostContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);
  const [dualPost, setDualPost] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editBio, setEditBio] = useState("");

  const { data: profile, isLoading: profileLoading } = useQuery<Profile>({
    queryKey: ["/api/profile"],
  });

  const { data: stats, isLoading: statsLoading } = useQuery<ProfileStats>({
    queryKey: ["/api/profile", profile?.id, "stats"],
    enabled: !!profile?.id,
  });

  const { data: posts = [], isLoading: postsLoading } = useQuery<Post[]>({
    queryKey: ["/api/profile", profile?.id, "posts"],
    enabled: !!profile?.id,
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const createPostMutation = useMutation({
    mutationFn: async (data: { content: string; mediaUrl?: string; mediaType?: string; dualPostToPublic?: boolean }) => {
      return await apiRequest("POST", "/api/posts", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile", profile?.id, "posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/profile", profile?.id, "stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      setNewPostContent("");
      setMediaUrl(null);
      setMediaType(null);
      toast({ title: "Posted!", description: dualPost ? "Your update has been shared to your profile and public feed." : "Your update has been shared to your profile." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create post.", variant: "destructive" });
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<Profile>) => {
      return await apiRequest("PATCH", "/api/profile", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      setIsEditing(false);
      toast({ title: "Profile Updated", description: "Your profile has been updated." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update profile.", variant: "destructive" });
    },
  });

  const handlePost = () => {
    if (newPostContent.trim() || mediaUrl) {
      createPostMutation.mutate({
        content: newPostContent || "",
        mediaUrl: mediaUrl || undefined,
        mediaType: mediaType || undefined,
        dualPostToPublic: dualPost,
      });
    }
  };

  const handleMediaUploadComplete = async (result: any, type: "image" | "video") => {
    if (result.successful && result.successful.length > 0) {
      const objectPath = result.successful[0].meta?.objectPath;
      if (objectPath) {
        setMediaUrl(objectPath);
        setMediaType(type);
        toast({ title: "Uploaded!", description: `${type === "image" ? "Photo" : "Video"} ready to post.` });
      } else {
        toast({ title: "Upload Failed", description: "Could not process the uploaded file. Please try again.", variant: "destructive" });
      }
    }
  };

  const handleCoverUploadComplete = async (result: any) => {
    if (result.successful && result.successful.length > 0) {
      const objectPath = result.successful[0].meta?.objectPath;
      if (objectPath) {
        updateProfileMutation.mutate({ coverUrl: objectPath });
      } else {
        toast({ title: "Upload Failed", description: "Could not process the uploaded file.", variant: "destructive" });
      }
    }
  };

  const handleAvatarUploadComplete = async (result: any) => {
    if (result.successful && result.successful.length > 0) {
      const objectPath = result.successful[0].meta?.objectPath;
      if (objectPath) {
        updateProfileMutation.mutate({ avatarUrl: objectPath });
      } else {
        toast({ title: "Upload Failed", description: "Could not process the uploaded file.", variant: "destructive" });
      }
    }
  };

  const getUploadParams = async () => {
    const response = await apiRequest("POST", "/api/objects/upload");
    const data = await response.json();
    const uploadData = data.uploadURL;
    return { 
      method: "PUT" as const, 
      url: uploadData.uploadURL,
      meta: { objectPath: uploadData.objectPath }
    };
  };

  const getUserById = (userId: string | null) => {
    if (!userId) return null;
    return users.find(u => u.id === userId);
  };

  const currentUserName = currentUser 
    ? `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || currentUser.email || 'You'
    : 'You';

  const displayName = profile?.displayName || currentUserName;

  const clearMedia = () => {
    setMediaUrl(null);
    setMediaType(null);
  };

  const handleStartEditing = () => {
    setEditBio(profile?.bio || "");
    setIsEditing(true);
  };

  const handleSaveBio = () => {
    updateProfileMutation.mutate({ bio: editBio });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (profileLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const mediaPosts = posts.filter(p => p.mediaUrl);

  return (
    <div className="space-y-6">
      <div className="relative">
        <div 
          className="h-48 bg-gradient-to-r from-primary/20 to-primary/10 relative overflow-hidden"
          style={profile?.coverUrl ? { backgroundImage: `url(${profile.coverUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
        >
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute top-4 right-4 z-10">
            <ObjectUploader
              maxNumberOfFiles={1}
              maxFileSize={10485760}
              allowedFileTypes={["image/*"]}
              onGetUploadParameters={getUploadParams}
              onComplete={handleCoverUploadComplete}
              buttonVariant="secondary"
              buttonSize="sm"
            >
              <Camera className="h-4 w-4 mr-1" />
              Edit Cover
            </ObjectUploader>
          </div>
        </div>

        <div className="px-6 pb-6">
          <div className="relative flex flex-col md:flex-row md:items-end gap-4 -mt-16">
            <div className="relative">
              <div className="h-32 w-32 rounded-full border-4 border-background bg-background overflow-hidden">
                {profile?.avatarUrl ? (
                  <img src={profile.avatarUrl} alt={displayName} className="h-full w-full object-cover" />
                ) : (
                  <UserAvatar name={displayName} size="lg" className="h-full w-full text-4xl" />
                )}
              </div>
              <div className="absolute bottom-0 right-0">
                <ObjectUploader
                  maxNumberOfFiles={1}
                  maxFileSize={5242880}
                  allowedFileTypes={["image/*"]}
                  onGetUploadParameters={getUploadParams}
                  onComplete={handleAvatarUploadComplete}
                  buttonVariant="secondary"
                  buttonSize="icon"
                >
                  <Camera className="h-4 w-4" />
                </ObjectUploader>
              </div>
            </div>

            <div className="flex-1 md:pb-4">
              <h1 className="text-2xl font-semibold" data-testid="text-profile-name">{displayName}</h1>
              {profile?.location && (
                <div className="flex items-center gap-1 text-muted-foreground text-sm mt-1">
                  <MapPin className="h-4 w-4" />
                  <span>{profile.location}</span>
                </div>
              )}
              {profile?.website && (
                <div className="flex items-center gap-1 text-primary text-sm mt-1">
                  <Globe className="h-4 w-4" />
                  <a href={profile.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {profile.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
            </div>
          </div>

          {isEditing ? (
            <div className="mt-4 space-y-3">
              <Textarea
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                placeholder="Tell people about yourself..."
                className="resize-none"
                data-testid="input-profile-bio"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSaveBio} disabled={updateProfileMutation.isPending} data-testid="button-save-bio">
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={() => setIsEditing(false)} data-testid="button-cancel-edit">
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-4">
              {profile?.bio ? (
                <p className="text-muted-foreground">{profile.bio}</p>
              ) : (
                <p className="text-muted-foreground italic">No bio yet</p>
              )}
              <Button variant="ghost" size="sm" className="mt-2" onClick={handleStartEditing} data-testid="button-edit-bio">
                <Edit2 className="h-4 w-4 mr-1" />
                Edit Bio
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="px-6">
        <Card>
          <CardContent className="py-4">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-1.5">
                  <Heart className="h-5 w-5 text-red-500" />
                  <span className="text-2xl font-semibold" data-testid="stat-likes">
                    {statsLoading ? "-" : formatNumber(stats?.likes || 0)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">Likes</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-1.5">
                  <Users className="h-5 w-5 text-blue-500" />
                  <span className="text-2xl font-semibold" data-testid="stat-followers">
                    {statsLoading ? "-" : formatNumber(stats?.followers || 0)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">Followers</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-1.5">
                  <Play className="h-5 w-5 text-purple-500" />
                  <span className="text-2xl font-semibold" data-testid="stat-videos">
                    {statsLoading ? "-" : formatNumber(stats?.videos || 0)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">Videos</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-1.5">
                  <Camera className="h-5 w-5 text-green-500" />
                  <span className="text-2xl font-semibold" data-testid="stat-photos">
                    {statsLoading ? "-" : formatNumber(stats?.photos || 0)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">Photos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="px-6 max-w-3xl mx-auto">
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-3">
              <UserAvatar 
                name={displayName} 
                avatar={profile?.avatarUrl || currentUser?.profileImageUrl} 
                size="md" 
              />
              <div className="flex-1 space-y-3">
                <Textarea
                  placeholder="Share an update..."
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  className="resize-none min-h-[80px]"
                  data-testid="input-profile-post"
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
                        alt="Upload preview" 
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

                <div className="flex items-center justify-between gap-2 flex-wrap">
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
                      <Image className="h-4 w-4 mr-1" />
                      Photo
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
                      <Video className="h-4 w-4 mr-1" />
                      Video
                    </ObjectUploader>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Switch 
                        id="dual-post" 
                        checked={dualPost} 
                        onCheckedChange={setDualPost}
                        data-testid="switch-dual-post"
                      />
                      <Label htmlFor="dual-post" className="text-sm text-muted-foreground cursor-pointer">
                        Also post to public feed
                      </Label>
                    </div>
                    <Button 
                      onClick={handlePost} 
                      disabled={(!newPostContent.trim() && !mediaUrl) || createPostMutation.isPending}
                      data-testid="button-profile-post"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {createPostMutation.isPending ? "Posting..." : "Post"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {mediaPosts.length > 0 && (
        <div className="px-6">
          <h2 className="text-xl font-semibold mb-4">Media</h2>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {mediaPosts.map((post) => (
              <div 
                key={post.id} 
                className="aspect-square relative overflow-hidden rounded-lg bg-muted hover-elevate cursor-pointer"
                data-testid={`media-grid-item-${post.id}`}
              >
                {post.mediaType === "image" ? (
                  <img 
                    src={post.mediaUrl!} 
                    alt="Media" 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full relative">
                    <video 
                      src={post.mediaUrl!} 
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <Play className="h-8 w-8 text-white" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="px-6 max-w-3xl mx-auto space-y-4">
        <h2 className="text-xl font-semibold">All Posts</h2>
        {postsLoading ? (
          Array(3).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))
        ) : posts.length > 0 ? (
          posts.map((post) => {
            const author = getUserById(post.authorId);
            return (
              <SocialPostCard
                key={post.id}
                post={post}
                author={author}
                currentUserId={currentUser?.id}
              />
            );
          })
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <p className="text-lg mb-2">No posts yet</p>
              <p className="text-sm">Share your first update with your followers!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
