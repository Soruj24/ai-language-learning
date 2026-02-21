'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Badge } from '@/app/components/ui/badge';
import { useLanguage } from '@/app/lib/i18n/LanguageContext';
import { MessageSquare, ThumbsUp, Users, Share2 } from 'lucide-react';

// Mock Data
const initialPosts = [
  { id: 1, author: 'Sarah', content: 'Does anyone have tips for rolling Rs in Spanish?', upvotes: 5, comments: 2, time: '2 hours ago', category: 'Pronunciation' },
  { id: 2, author: 'Mike', content: 'Just finished my first 30-day streak! Feels amazing.', upvotes: 12, comments: 4, time: '5 hours ago', category: 'Motivation' },
];

const initialGroups = [
  { id: 1, name: 'Spanish Beginners', members: 120, description: 'A supportive group for those just starting with Spanish.' },
  { id: 2, name: 'French Literature Club', members: 45, description: 'Discussing classic French novels and poetry.' },
  { id: 3, name: 'German Grammar Geeks', members: 80, description: 'Deep dive into German grammar rules and exceptions.' },
];

const initialCorrections = [
  { id: 1, author: 'Juan', original: 'Yo gusto la pizza.', corrected: 'Me gusta la pizza.', explanation: 'In Spanish, we use "Me gusta" for "I like".', upvotes: 3 },
  { id: 2, author: 'Anna', original: 'J\'ai allé au cinéma.', corrected: 'Je suis allé au cinéma.', explanation: 'The verb "aller" uses "être" as the auxiliary verb in passé composé.', upvotes: 7 },
];

const initialResources = [
  { id: 1, title: '500 Most Common Spanish Words', type: 'PDF', link: '#', upvotes: 15 },
  { id: 2, title: 'French Pronunciation Guide', type: 'Video', link: '#', upvotes: 22 },
  { id: 3, title: 'German Case System Chart', type: 'Image', link: '#', upvotes: 8 },
];

export default function CommunityClient() {
  const { t } = useLanguage();
  const [posts, setPosts] = useState(initialPosts);
  const [groups] = useState(initialGroups);
  const [corrections, setCorrections] = useState(initialCorrections);
  const [resources, setResources] = useState(initialResources);
  const [newPostContent, setNewPostContent] = useState('');

  const handleUpvotePost = (id: number) => {
    setPosts(posts.map(post => post.id === id ? { ...post, upvotes: post.upvotes + 1 } : post));
  };

  const handleUpvoteCorrection = (id: number) => {
    setCorrections(corrections.map(c => c.id === id ? { ...c, upvotes: c.upvotes + 1 } : c));
  };

  const handleUpvoteResource = (id: number) => {
    setResources(resources.map(r => r.id === id ? { ...r, upvotes: r.upvotes + 1 } : r));
  };

  const handleCreatePost = () => {
    if (!newPostContent.trim()) return;
    const newPost = {
      id: posts.length + 1,
      author: 'You',
      content: newPostContent,
      upvotes: 0,
      comments: 0,
      time: 'Just now',
      category: 'General'
    };
    setPosts([newPost, ...posts]);
    setNewPostContent('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('communityForum')}</h1>
          <p className="text-muted-foreground">{t('connectLearners')}</p>
        </div>
        <Button>{t('createPost')}</Button>
      </div>

      <Tabs defaultValue="discussions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="discussions">{t('discussionPosts')}</TabsTrigger>
          <TabsTrigger value="groups">{t('languageGroups')}</TabsTrigger>
          <TabsTrigger value="corrections">{t('peerCorrections')}</TabsTrigger>
          <TabsTrigger value="resources">{t('shareResources')}</TabsTrigger>
        </TabsList>

        <TabsContent value="discussions" className="space-y-4">
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
                />
                <Button onClick={handleCreatePost}>{t('share')}</Button>
              </div>
            </CardContent>
          </Card>
          
          <div className="space-y-4">
            {posts.map(post => (
              <Card key={post.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{post.author}</CardTitle>
                      <div className="text-sm text-muted-foreground">{post.time} • <Badge variant="outline">{post.category}</Badge></div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p>{post.content}</p>
                </CardContent>
                <CardFooter className="flex gap-4">
                  <Button variant="ghost" size="sm" onClick={() => handleUpvotePost(post.id)}>
                    <ThumbsUp className="mr-2 h-4 w-4" /> {post.upvotes} {t('upvote')}
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MessageSquare className="mr-2 h-4 w-4" /> {post.comments} {t('comments')}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="groups" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {groups.map(group => (
              <Card key={group.id}>
                <CardHeader>
                  <CardTitle>{group.name}</CardTitle>
                  <CardDescription>{group.members} {t('members')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{group.description}</p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" variant="outline"><Users className="mr-2 h-4 w-4" /> {t('joinGroup')}</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="corrections" className="space-y-4">
          <Card>
             <CardHeader>
                 <CardTitle>{t('submitCorrection')}</CardTitle>
                 <CardDescription>{t('correctText')}</CardDescription>
             </CardHeader>
             <CardContent>
                 <Button className="w-full">{t('submitCorrection')}</Button>
             </CardContent>
          </Card>
          
          <div className="space-y-4">
            {corrections.map(correction => (
              <Card key={correction.id}>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">{t('postedBy')} {correction.author}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded">
                    <span className="font-semibold text-red-600 dark:text-red-400">{t('originalText')}:</span> {correction.original}
                  </div>
                  <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded">
                    <span className="font-semibold text-green-600 dark:text-green-400">{t('correctedText')}:</span> {correction.corrected}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{correction.explanation}</p>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" size="sm" onClick={() => handleUpvoteCorrection(correction.id)}>
                    <ThumbsUp className="mr-2 h-4 w-4" /> {correction.upvotes} {t('upvote')}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>{t('shareResources')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-2">
                        <Input placeholder={t('resourceTitle')} />
                        <Input placeholder={t('resourceLink')} />
                        <Button className="w-full">{t('share')}</Button>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
                {resources.map(resource => (
                    <Card key={resource.id}>
                        <CardHeader>
                            <CardTitle className="text-lg">{resource.title}</CardTitle>
                            <div className="text-sm text-muted-foreground"><Badge>{resource.type}</Badge></div>
                        </CardHeader>
                        <CardFooter className="justify-between">
                            <Button variant="ghost" size="sm" onClick={() => handleUpvoteResource(resource.id)}>
                                <ThumbsUp className="mr-2 h-4 w-4" /> {resource.upvotes}
                            </Button>
                            <Button variant="outline" size="sm">
                                <Share2 className="mr-2 h-4 w-4" /> {t('share')}
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
