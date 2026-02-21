'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type Peer from 'peerjs';
import type { MediaConnection, DataConnection } from 'peerjs';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Badge } from '@/app/components/ui/badge';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import { 
  Mic, MicOff, Video, VideoOff, PhoneOff, Monitor, MessageSquare, 
  Users, BookOpen, Send, Settings 
} from 'lucide-react';
import { useLanguage } from '@/app/lib/i18n/LanguageContext';
import { cn } from '@/app/lib/utils';

interface LiveSessionClientProps {
  sessionId: string;
  userName: string;
  userId: string;
  userRole: 'student' | 'teacher' | 'admin';
}

interface PeerData {
  id: string; // Peer ID
  userId: string;
  name: string;
  role: string;
  isMuted: boolean;
  isVideoOff: boolean;
}

type PeerMessage = 
  | { type: 'join'; userId: string; name: string; role: string }
  | { type: 'peers-update'; peers: [string, PeerData][] }
  | { type: 'chat'; senderName: string; text: string; timestamp: string }
  | { type: 'lesson-update'; lessonId: string };

interface ChatMessage {
  id: string;
  senderName: string;
  text: string;
  timestamp: Date;
  isSystem?: boolean;
}

export default function LiveSessionClient({ sessionId, userName, userId, userRole }: LiveSessionClientProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { t } = useLanguage();
  const router = useRouter();
  
  // State
  const [mounted, setMounted] = useState(false);
  const [peer, setPeer] = useState<Peer | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [myPeerId, setMyPeerId] = useState<string>('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('connecting');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [peers, setPeers] = useState<Map<string, PeerData>>(new Map());
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [activeTab, setActiveTab] = useState<'participants' | 'chat' | 'lessons'>('participants');
  const [activeLesson, setActiveLesson] = useState<string | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());

  useEffect(() => {
    setMounted(true);
  }, []);

  const availableLessons = [
    { id: 'L1', title: 'Basic Greetings', content: 'Hola! Buenos días. ¿Cómo estás? (Hello! Good morning. How are you?)' },
    { id: 'L2', title: 'Numbers & Colors', content: 'Uno (1), Dos (2), Tres (3). Rojo (Red), Azul (Blue), Verde (Green).' },
    { id: 'L3', title: 'Food & Drink', content: 'La comida (food), La bebida (drink), El agua (water), El pan (bread).' },
    { id: 'L4', title: 'Family & Friends', content: 'Madre (Mother), Padre (Father), Amigo (Friend), Hermano (Brother).' },
  ];

  // Refs
  const myVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnections = useRef<Map<string, DataConnection>>(new Map());
  const callConnections = useRef<Map<string, MediaConnection>>(new Map());
  const hostId = `${sessionId}-host`;
  const isHost = userRole === 'teacher' || userRole === 'admin';

  // Initialize Peer
  useEffect(() => {
    if (!mounted) return;

    const initPeer = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setStream(stream);
        if (myVideoRef.current) {
          myVideoRef.current.srcObject = stream;
        }

        // Import PeerJS dynamically to avoid SSR issues
        const PeerJs = (await import('peerjs')).default;

        const newPeer = isHost 
          ? new PeerJs(hostId, { debug: 2 }) 
          : new PeerJs({ debug: 2 });

        newPeer.on('open', (id) => {
          console.log('My peer ID is: ' + id);
          setMyPeerId(id);
          setConnectionStatus('connected');

          if (!isHost) {
            connectToHost(newPeer);
          }
        });

        newPeer.on('connection', (conn) => {
          handleDataConnection(conn, newPeer, stream);
        });

        newPeer.on('call', (call) => {
          handleIncomingCall(call, stream);
        });

        newPeer.on('error', (err) => {
          console.error('Peer error:', err);
          setConnectionStatus('error');
          if (err.type === 'unavailable-id' && isHost) {
            // Host ID taken, maybe rejoin as participant or alert
            alert('Session already active or ID taken.');
          }
        });

        setPeer(newPeer);
      } catch (err) {
        console.error('Failed to get local stream', err);
        setConnectionStatus('error');
      }
    };

    initPeer();

    return () => {
      stream?.getTracks().forEach(track => track.stop());
      peer?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, isHost]);

  // Connect to Host (as Student)
  const connectToHost = (currentPeer: Peer) => {
    const conn = currentPeer.connect(hostId, {
      metadata: { userId, name: userName, role: userRole }
    });

    conn.on('open', () => {
      console.log('Connected to host');
      peerConnections.current.set(hostId, conn);
      
      // Send join message
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      conn.send({ type: 'join', userId, name: userName, role: userRole } as any);
    });

    conn.on('data', (data: unknown) => {
      handleDataMessage(data as PeerMessage);
    });

    conn.on('close', () => {
      console.log('Connection to host closed');
      setConnectionStatus('disconnected');
    });
  };

  // Handle Incoming Data Connection (Host side mostly)
  const handleDataConnection = (conn: DataConnection, currentPeer: Peer, currentStream: MediaStream) => {
    conn.on('open', () => {
      console.log('Data connection opened with:', conn.peer);
      peerConnections.current.set(conn.peer, conn);
    });

    conn.on('data', (data: unknown) => {
      handleDataMessage(data as PeerMessage, conn.peer, currentPeer, currentStream);
    });

    conn.on('close', () => {
      console.log('Data connection closed:', conn.peer);
      peerConnections.current.delete(conn.peer);
      removePeer(conn.peer);
    });
  };

  // Handle Data Messages
  const handleDataMessage = (data: PeerMessage, senderPeerId?: string, currentPeer?: Peer, currentStream?: MediaStream) => {
    console.log('Received data:', data);

    switch (data.type) {
      case 'join':
        if (isHost && senderPeerId && currentPeer && currentStream) {
          // Add to peers list
          const newPeerData: PeerData = {
            id: senderPeerId,
            userId: data.userId,
            name: data.name,
            role: data.role,
            isMuted: false,
            isVideoOff: false
          };
          
          setPeers(prev => new Map(prev).set(senderPeerId, newPeerData));
          
          // Call the student back
          const call = currentPeer.call(senderPeerId, currentStream);
          handleCall(call);

          // Broadcast updated peer list to all
          broadcastPeers();
        }
        break;
      
      case 'peers-update':
        if (!isHost) {
          // Update local peers list from host
          const newPeers = new Map<string, PeerData>(data.peers);
          setPeers(newPeers);
        }
        break;

      case 'chat':
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          senderName: data.senderName,
          text: data.text,
          timestamp: new Date(data.timestamp),
          isSystem: false
        }]);
        break;

      case 'lesson-update':
        setActiveLesson(data.lessonId);
        break;
    }
  };

  // Handle Incoming Call (Student side)
  const handleIncomingCall = (call: MediaConnection, currentStream: MediaStream) => {
    console.log('Incoming call from:', call.peer);
    call.answer(currentStream);
    handleCall(call);
  };

  // Common Call Handling
  const handleCall = (call: MediaConnection) => {
    callConnections.current.set(call.peer, call);

    call.on('stream', (remoteStream) => {
      console.log('Received stream from:', call.peer);
      setRemoteStreams(prev => new Map(prev).set(call.peer, remoteStream));
    });

    call.on('close', () => {
      console.log('Call closed:', call.peer);
      setRemoteStreams(prev => {
        const newMap = new Map(prev);
        newMap.delete(call.peer);
        return newMap;
      });
    });

    call.on('error', (err) => {
      console.error('Call error:', err);
    });
  };

  // Helpers
  const removePeer = (peerId: string) => {
    setPeers(prev => {
      const newMap = new Map(prev);
      newMap.delete(peerId);
      return newMap;
    });
    setRemoteStreams(prev => {
      const newMap = new Map(prev);
      newMap.delete(peerId);
      return newMap;
    });
    if (isHost) broadcastPeers();
  };

  const broadcastPeers = () => {
    if (!isHost) return;
    const peersList = Array.from(peers.entries());
    const msg = { type: 'peers-update', peers: peersList };
    peerConnections.current.forEach(conn => conn.send(msg));
  };

  const sendMessage = () => {
    if (!inputMessage.trim()) return;

    const msg = {
      type: 'chat',
      senderName: userName,
      text: inputMessage,
      timestamp: new Date().toISOString()
    };

    // Update local state
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      senderName: userName,
      text: inputMessage,
      timestamp: new Date(),
      isSystem: false
    }]);

    // Send to others
    if (isHost) {
      peerConnections.current.forEach(conn => conn.send(msg));
    } else {
      const hostConn = peerConnections.current.get(hostId);
      if (hostConn) hostConn.send(msg);
    }

    setInputMessage('');
  };

  const toggleMute = () => {
    if (stream) {
      stream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (stream) {
      stream.getVideoTracks().forEach(track => track.enabled = !track.enabled);
      setIsVideoOff(!isVideoOff);
    }
  };

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      // Stop sharing
      const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      const videoTrack = cameraStream.getVideoTracks()[0];
      
      callConnections.current.forEach(call => {
        const sender = call.peerConnection.getSenders().find(s => s.track?.kind === 'video');
        if (sender) sender.replaceTrack(videoTrack);
      });

      if (myVideoRef.current) myVideoRef.current.srcObject = cameraStream;
      setStream(cameraStream);
      setIsScreenSharing(false);
    } else {
      // Start sharing
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = screenStream.getVideoTracks()[0];

        callConnections.current.forEach(call => {
          const sender = call.peerConnection.getSenders().find(s => s.track?.kind === 'video');
          if (sender) sender.replaceTrack(screenTrack);
        });

        if (myVideoRef.current) myVideoRef.current.srcObject = screenStream;
        
        screenTrack.onended = () => {
            toggleScreenShare(); // Revert when user stops sharing via browser UI
        };

        setIsScreenSharing(true);
      } catch (err) {
        console.error("Error sharing screen:", err);
      }
    }
  };

  const shareLesson = (lessonId: string) => {
    setActiveLesson(lessonId);
    if (isHost) {
      const msg = { type: 'lesson-update', lessonId };
      peerConnections.current.forEach(conn => conn.send(msg));
    }
  };

  const endCall = () => {
    peer?.destroy();
    router.push(isHost ? '/teacher' : '/dashboard');
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Initializing session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container h-[calc(100vh-4rem)] p-4 max-w-[1600px] mx-auto flex gap-4">
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 border-b flex items-center justify-between px-6 bg-background/95 backdrop-blur z-10">
          <div className="flex items-center gap-4">
            <h1 className="font-semibold text-lg flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Live Session
            </h1>
            <Badge variant="outline" className="font-mono text-xs">{sessionId}</Badge>
          </div>
          <div className="flex items-center gap-2">
            {activeLesson && <Badge variant="secondary">Lesson: {activeLesson}</Badge>}
            <Button variant="destructive" size="sm" onClick={endCall}>
              <PhoneOff className="w-4 h-4 mr-2" />
              End Call
            </Button>
          </div>
        </header>

        {/* Video Grid */}
        <div className="flex-1 p-4 overflow-y-auto bg-muted/20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto h-full">
            {/* My Video */}
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden shadow-lg ring-1 ring-border">
              <video ref={myVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
              <div className="absolute bottom-4 left-4 text-white font-medium text-sm bg-black/50 px-2 py-1 rounded">
                {userName} (You)
              </div>
              <div className="absolute top-4 right-4 flex gap-2">
                {isMuted && <MicOff className="w-4 h-4 text-red-500" />}
                {isVideoOff && <VideoOff className="w-4 h-4 text-red-500" />}
              </div>
            </div>

            {/* Remote Videos */}
            {Array.from(remoteStreams.entries()).map(([peerId, stream]) => (
              <RemoteVideo 
                key={peerId} 
                stream={stream} 
                name={peers.get(peerId)?.name || 'Unknown User'} 
                role={peers.get(peerId)?.role || 'student'}
              />
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="h-20 border-t bg-background flex items-center justify-center gap-4 px-6">
          <Button 
            variant={isMuted ? "destructive" : "secondary"} 
            size="icon" 
            className="h-12 w-12 rounded-full"
            onClick={toggleMute}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </Button>
          <Button 
            variant={isVideoOff ? "destructive" : "secondary"} 
            size="icon" 
            className="h-12 w-12 rounded-full"
            onClick={toggleVideo}
          >
            {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          </Button>
          <Button 
            variant={isScreenSharing ? "default" : "secondary"} 
            size="icon" 
            className="h-12 w-12 rounded-full"
            onClick={toggleScreenShare}
          >
            <Monitor className="w-5 h-5" />
          </Button>
          {isHost && (
             <Button variant="secondary" size="icon" className="h-12 w-12 rounded-full">
                <Settings className="w-5 h-5" />
             </Button>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-80 border-l bg-muted/10 flex flex-col">
        {/* Tabs Header */}
        <div className="flex border-b bg-background">
          <Button 
            variant={activeTab === 'participants' ? 'secondary' : 'ghost'} 
            onClick={() => setActiveTab('participants')} 
            className="flex-1 rounded-none h-12 border-b-2 border-transparent data-[state=active]:border-primary"
            data-state={activeTab === 'participants' ? 'active' : ''}
          >
            <Users className="w-4 h-4 mr-2" /> Users
          </Button>
          <Button 
            variant={activeTab === 'chat' ? 'secondary' : 'ghost'} 
            onClick={() => setActiveTab('chat')} 
            className="flex-1 rounded-none h-12 border-b-2 border-transparent data-[state=active]:border-primary"
            data-state={activeTab === 'chat' ? 'active' : ''}
          >
            <MessageSquare className="w-4 h-4 mr-2" /> Chat
          </Button>
          <Button 
            variant={activeTab === 'lessons' ? 'secondary' : 'ghost'} 
            onClick={() => setActiveTab('lessons')} 
            className="flex-1 rounded-none h-12 border-b-2 border-transparent data-[state=active]:border-primary"
            data-state={activeTab === 'lessons' ? 'active' : ''}
          >
            <BookOpen className="w-4 h-4 mr-2" /> Lessons
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col min-h-0 relative">
          {activeTab === 'participants' && (
            <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                            <AvatarFallback>{userName[0]}</AvatarFallback>
                        </Avatar>
                        <div className="text-sm font-medium">{userName} (You)</div>
                        <Badge variant="outline" className="ml-auto text-xs">{userRole}</Badge>
                    </div>
                    {Array.from(peers.values()).map(peer => (
                        <div key={peer.id} className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                                <AvatarFallback>{peer.name[0]}</AvatarFallback>
                            </Avatar>
                            <div className="text-sm font-medium">{peer.name}</div>
                            <Badge variant="outline" className="ml-auto text-xs">{peer.role}</Badge>
                        </div>
                    ))}
                </div>
            </ScrollArea>
          )}

          {activeTab === 'chat' && (
            <>
              <ScrollArea className="flex-1 p-4 bg-background">
                  <div className="space-y-4">
                      {messages.map(msg => (
                          <div key={msg.id} className={cn("flex flex-col", msg.senderName === userName ? "items-end" : "items-start")}>
                              <div className="text-xs text-muted-foreground mb-1">{msg.senderName}</div>
                              <div className={cn(
                                  "px-3 py-2 rounded-lg text-sm max-w-[85%]",
                                  msg.senderName === userName ? "bg-primary text-primary-foreground" : "bg-muted"
                              )}>
                                  {msg.text}
                              </div>
                          </div>
                      ))}
                  </div>
              </ScrollArea>
              <div className="p-4 bg-background border-t">
                  <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-2">
                      <Input 
                          value={inputMessage} 
                          onChange={e => setInputMessage(e.target.value)}
                          placeholder="Type a message..."
                      />
                      <Button type="submit" size="icon">
                          <Send className="w-4 h-4" />
                      </Button>
                  </form>
              </div>
            </>
          )}

          {activeTab === 'lessons' && (
            <ScrollArea className="flex-1 p-4">
               <div className="space-y-4">
                  <h3 className="font-semibold mb-2">Current Lesson</h3>
                  {activeLesson ? (
                      <Card>
                          <CardHeader className="p-4">
                              <CardTitle className="text-sm">
                                 {availableLessons.find(l => l.id === activeLesson)?.title || activeLesson}
                              </CardTitle>
                          </CardHeader>
                          <CardContent className="p-4 pt-0">
                              <div className="text-sm bg-muted p-3 rounded-md">
                                  {availableLessons.find(l => l.id === activeLesson)?.content || 'Lesson content loading...'}
                              </div>
                              <p className="text-xs text-muted-foreground mt-2">
                                  This lesson is currently active for all participants.
                              </p>
                          </CardContent>
                      </Card>
                  ) : (
                      <div className="text-center p-8 border border-dashed rounded-lg text-muted-foreground">
                          No active lesson
                      </div>
                  )}

                  {isHost && (
                      <>
                          <h3 className="font-semibold mt-6 mb-2">Available Lessons</h3>
                          <div className="grid gap-2">
                              {availableLessons.map(lesson => (
                                  <Button 
                                    key={lesson.id} 
                                    variant={activeLesson === lesson.id ? "secondary" : "outline"}
                                    className="justify-start h-auto py-3"
                                    onClick={() => shareLesson(lesson.id)}
                                  >
                                      <div className="flex flex-col items-start text-left">
                                          <span className="font-medium">{lesson.title}</span>
                                          <span className="text-xs text-muted-foreground">Click to share</span>
                                      </div>
                                  </Button>
                              ))}
                          </div>
                      </>
                  )}
               </div>
            </ScrollArea>
          )}
        </div>
      </div>
    </div>
  );
}

function RemoteVideo({ stream, name, role }: { stream: MediaStream, name: string, role: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="relative aspect-video bg-black rounded-lg overflow-hidden shadow-lg ring-1 ring-border">
      <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
      <div className="absolute bottom-4 left-4 text-white font-medium text-sm bg-black/50 px-2 py-1 rounded">
        {name}
      </div>
      <Badge className="absolute top-4 left-4 bg-black/50 hover:bg-black/60 border-none text-white">
        {role}
      </Badge>
    </div>
  );
}
