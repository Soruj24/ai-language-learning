'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Progress } from '@/app/components/ui/progress';
import { useLanguage } from '@/app/lib/i18n/LanguageContext';
import { Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Student {
  id: string;
  name: string;
  email: string;
  progress: number;
  lastActive: string;
  language: string;
}

interface Session {
  _id: string;
  topic: string;
  startTime: string;
  attendees: string[];
  status: string;
}

export default function TeacherClient() {
  const { t } = useLanguage();
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [assignmentTopic, setAssignmentTopic] = useState('');
  const [assignStudentId, setAssignStudentId] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [studentsRes, sessionsRes] = await Promise.all([
          fetch('/api/teacher/students'),
          fetch('/api/teacher/sessions')
        ]);

        if (studentsRes.ok) {
          const data = await studentsRes.json();
          setStudents(data.students);
        }

        if (sessionsRes.ok) {
          const data = await sessionsRes.json();
          setSessions(data.sessions);
        }
      } catch (error) {
        console.error('Failed to fetch teacher data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSendFeedback = (studentId: string) => {
    // In a real app, this would call an API
    alert(`Feedback sent to student ${studentId}: ${feedback}`);
    setFeedback('');
    setSelectedStudent(null);
  };

  const handleAssignLesson = async () => {
      if (!assignStudentId || !assignmentTopic) {
          alert('Please select a student and enter a topic.');
          return;
      }

      try {
        const response = await fetch('/api/teacher/assignments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId: assignStudentId,
            topic: assignmentTopic,
            description: `Assignment: ${assignmentTopic}`
          })
        });

        if (response.ok) {
          alert(`Lesson "${assignmentTopic}" assigned successfully!`);
          setAssignmentTopic('');
          setAssignStudentId('');
        } else {
          alert('Failed to assign lesson.');
        }
      } catch (error) {
        console.error('Error assigning lesson:', error);
        alert('An error occurred.');
      }
  };
  
  const handleHostSession = async () => {
      const sessionId = uuidv4();
      // Optionally create a session record here
      router.push(`/live-session/${sessionId}`);
  }

  const handleCreateSession = async () => {
    // Simple prompt for now, could be a modal
    const topic = prompt("Enter session topic:");
    if (!topic) return;

    try {
      const response = await fetch('/api/teacher/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          startTime: new Date().toISOString() // Defaults to now
        })
      });

      if (response.ok) {
        const { session } = await response.json();
        setSessions([...sessions, session]);
      }
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('teacherDashboard')}</h1>
        <p className="text-muted-foreground">{t('manageStudents')}</p>
      </div>

      <Tabs defaultValue="students" className="space-y-4">
        <TabsList>
          <TabsTrigger value="students">{t('students')}</TabsTrigger>
          <TabsTrigger value="assignments">{t('assignLesson')}</TabsTrigger>
          <TabsTrigger value="live-sessions">{t('liveSessions')}</TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="space-y-4">
          {students.length === 0 ? (
             <div className="text-center p-8 text-muted-foreground">
               No students found.
             </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {students.map((student) => (
                <Card key={student.id}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {student.name}
                    </CardTitle>
                    <span className="text-xs text-muted-foreground">{student.language}</span>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{student.progress}%</div>
                    <Progress value={student.progress} className="mt-2" />
                    <p className="text-xs text-muted-foreground mt-2">
                      Last active: {student.lastActive}
                    </p>
                    <div className="mt-4 space-y-2">
                       <Button variant="outline" className="w-full" onClick={() => setSelectedStudent(selectedStudent === student.id ? null : student.id)}>
                          {selectedStudent === student.id ? t('actions') : t('actions')}
                       </Button>
                    </div>
                  </CardContent>
                   {selectedStudent === student.id && (
                      <div className="p-4 border-t bg-muted/50">
                          <Label>{t('sendFeedback')}</Label>
                          <Input 
                              value={feedback} 
                              onChange={(e) => setFeedback(e.target.value)} 
                              placeholder={t('message')} 
                              className="mb-2 mt-2"
                          />
                          <div className="flex gap-2">
                              <Button size="sm" onClick={() => handleSendFeedback(student.id)}>{t('sendFeedback')}</Button>
                              <Button size="sm" variant="ghost" onClick={() => setSelectedStudent(null)}>Cancel</Button>
                          </div>
                      </div>
                   )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>{t('createAssignment')}</CardTitle>
                    <CardDescription>{t('assignLesson')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-2">
                        <Label>{t('selectStudent')}</Label>
                        <select 
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={assignStudentId}
                            onChange={(e) => setAssignStudentId(e.target.value)}
                        >
                            <option value="">{t('selectStudent')}</option>
                            {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                    <div className="grid gap-2">
                        <Label>{t('lessonTopic')}</Label>
                        <Input 
                            value={assignmentTopic} 
                            onChange={(e) => setAssignmentTopic(e.target.value)} 
                            placeholder="e.g. Past Tense Verbs" 
                        />
                    </div>
                    <Button onClick={handleAssignLesson} disabled={!assignStudentId || !assignmentTopic}>{t('assignLesson')}</Button> 
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="live-sessions" className="space-y-4">
             <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">{t('upcomingSessions')}</h2>
                <div className="space-x-2">
                  <Button variant="outline" onClick={handleCreateSession}>Schedule Session</Button>
                  <Button onClick={handleHostSession}>{t('hostSession')}</Button>
                </div>
             </div>
             {sessions.length === 0 ? (
               <div className="text-center p-8 text-muted-foreground">
                 No upcoming sessions.
               </div>
             ) : (
               <div className="grid gap-4">
                  {sessions.map(session => (
                      <Card key={session._id}>
                          <CardHeader>
                              <CardTitle>{session.topic}</CardTitle>
                              <CardDescription>
                                {new Date(session.startTime).toLocaleString()}
                              </CardDescription>
                          </CardHeader>
                          <CardContent>
                              <p>{session.attendees?.length || 0} students attending</p>
                              <Button className="mt-2" variant="outline" onClick={() => router.push(`/live-session/${session._id}`)}>
                                {t('startSession')}
                              </Button>
                          </CardContent>
                      </Card>
                  ))}
               </div>
             )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
