'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Badge } from '@/app/components/ui/badge';
import { useLanguage } from '@/app/lib/i18n/LanguageContext';
import { MessageSquare, ThumbsUp, Users, Share2, Loader2, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function CommunityClient() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('discussion');
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  
  // States for other creation forms
  const [correctionOriginal, setCorrectionOriginal] = useState('');
  const [correctionCorrected, setCorrectionCorrected] = useState('');
  const [correctionExplanation, setCorrectionExplanation] = useState('');
  const [resourceTitle, setResourceTitle] = useState('');
  const [resourceLink, setResourceLink] = useState('');
  const [resourceType, setResourceType] = useState('Link');

  const fetchPosts = async (type: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/community/posts?type=${type}`);
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts);
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(activeTab);
  }, [activeTab]);

  const handleUpvote = async (id: string) => {
    try {
      const response = await fetch(`/api/community/posts/${id}/upvote`, {
        method: 'POST',
      });
      if (response.ok) {
        const data = await response.json();
        setPosts(posts.map(post => 
          post._id === id ? { ...post, upvoteCount: data.upvotes } : post
        ));
      }
    } catch (error) {
      console.error('Failed to upvote:', error);
    }
  };

  const handleCreatePost = async (type: string, data: any) => {
    try {
      const response = await fetch('/api/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, ...data }),
      });

      if (response.ok) {
        const { post } = await response.json();
        setPosts([post, ...posts]);
        // Reset forms
        setNewPostContent('');
        setCorrectionOriginal('');
        setCorrectionCorrected('');
        setCorrectionExplanation('');
        setResourceTitle('');
        setResourceLink('');
      }
    } catch (error) {
      console.error('Failed to create post:', error);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return 'just now';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('communityForum')}</h1>
          <p className="text-muted-foreground">{t('connectLearners')}</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="discussion">{t('discussionPosts')}</TabsTrigger>
          <TabsTrigger value="group">{t('languageGroups')}</TabsTrigger>
          <TabsTrigger value="correction">{t('peerCorrections')}</TabsTrigger>
          <TabsTrigger value="resource">{t('shareResources')}</TabsTrigger>
        </TabsList>

        {/* Discussion Tab */}
        <TabsContent value="discussion" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('createPost')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input 
                  placeholder={t('writeComment')} 
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newPostContent.trim()) {
                      handleCreatePost('discussion', { content: newPostContent });
                    }
                  }}
                />
                <Button 
                  onClick={() => handleCreatePost('discussion', { content: newPostContent })}
                  disabled={!newPostContent.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              No discussions yet. Be the first to start one!
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map(post => (
                <Card key={post._id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{post.authorName}</CardTitle>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(post.createdAt)} • <Badge variant="outline">{post.category}</Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p>{post.content}</p>
                  </CardContent>
                  <CardFooter className="flex gap-4">
                    <Button variant="ghost" size="sm" onClick={() => handleUpvote(post._id)}>
                      <ThumbsUp className="mr-2 h-4 w-4" /> {post.upvoteCount} {t('upvote')}
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MessageSquare className="mr-2 h-4 w-4" /> {post.commentCount} {t('comments')}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Groups Tab */}
        <TabsContent value="group" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create Group</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                <Input 
                  placeholder="Group Name" 
                  value={newPostContent} // reusing state for simplicity
                  onChange={(e) => setNewPostContent(e.target.value)}
                />
                 <Input 
                  placeholder="Description" 
                  value={correctionExplanation} // reusing state
                  onChange={(e) => setCorrectionExplanation(e.target.value)}
                />
                <Button 
                  className="w-full"
                  onClick={() => handleCreatePost('group', { title: newPostContent, content: correctionExplanation })}
                  disabled={!newPostContent.trim()}
                >
                  Create Group
                </Button>
              </div>
            </CardContent>
          </Card>

          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {posts.map(group => (
                <Card key={group._id}>
                  <CardHeader>
                    <CardTitle>{group.title}</CardTitle>
                    <CardDescription>{group.memberCount} {t('members')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{group.content}</p>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" variant="outline"><Users className="mr-2 h-4 w-4" /> {t('joinGroup')}</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Corrections Tab */}
        <TabsContent value="correction" className="space-y-4">
          <Card>
             <CardHeader>
                 <CardTitle>{t('submitCorrection')}</CardTitle>
                 <CardDescription>{t('correctText')}</CardDescription>
             </CardHeader>
             <CardContent className="space-y-4">
                 <Input 
                   placeholder="Original Text (with error)" 
                   value={correctionOriginal}
                   onChange={(e) => setCorrectionOriginal(e.target.value)}
                 />
                 <Input 
                   placeholder="Corrected Text" 
                   value={correctionCorrected}
                   onChange={(e) => setCorrectionCorrected(e.target.value)}
                 />
                 <Input 
                   placeholder="Explanation" 
                   value={correctionExplanation}
                   onChange={(e) => setCorrectionExplanation(e.target.value)}
                 />
                 <Button 
                   className="w-full"
                   onClick={() => handleCreatePost('correction', { 
                     originalText: correctionOriginal, 
                     correctedText: correctionCorrected, 
                     explanation: correctionExplanation 
                   })}
                   disabled={!correctionOriginal.trim() || !correctionCorrected.trim()}
                 >
                   {t('submitCorrection')}
                 </Button>
             </CardContent>
          </Card>
          
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map(correction => (
                <Card key={correction._id}>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">{t('postedBy')} {correction.authorName}</CardTitle>
                    <div className="text-xs text-muted-foreground">{formatDate(correction.createdAt)}</div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded">
                      <span className="font-semibold text-red-600 dark:text-red-400">{t('originalText')}:</span> {correction.originalText}
                    </div>
                    <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded">
                      <span className="font-semibold text-green-600 dark:text-green-400">{t('correctedText')}:</span> {correction.correctedText}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{correction.explanation}</p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="ghost" size="sm" onClick={() => handleUpvote(correction._id)}>
                      <ThumbsUp className="mr-2 h-4 w-4" /> {correction.upvoteCount} {t('upvote')}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resource" className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>{t('shareResources')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-2">
                        <Input 
                          placeholder={t('resourceTitle')} 
                          value={resourceTitle}
                          onChange={(e) => setResourceTitle(e.target.value)}
                        />
                        <Input 
                          placeholder={t('resourceLink')} 
                          value={resourceLink}
                          onChange={(e) => setResourceLink(e.target.value)}
                        />
                        <Button 
                          className="w-full"
                          onClick={() => handleCreatePost('resource', { title: resourceTitle, link: resourceLink, resourceType: 'Link' })}
                          disabled={!resourceTitle.trim() || !resourceLink.trim()}
                        >
                          {t('share')}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {isLoading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map(resource => (
                  <Card key={resource._id}>
                    <CardHeader>
                      <CardTitle>{resource.title}</CardTitle>
                      <CardDescription>{t('postedBy')} {resource.authorName}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <a href={resource.link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">
                        {resource.link}
                      </a>
                    </CardContent>
                    <CardFooter>
                      <Button variant="ghost" size="sm" onClick={() => handleUpvote(resource._id)}>
                        <ThumbsUp className="mr-2 h-4 w-4" /> {resource.upvoteCount} {t('upvote')}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
