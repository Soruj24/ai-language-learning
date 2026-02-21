'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Progress } from '@/app/components/ui/progress';
import { useLanguage } from '@/app/lib/i18n/LanguageContext';

// Mock Data
const students = [
  { id: 1, name: 'Alice Johnson', progress: 75, lastActive: '2 hours ago', language: 'Spanish' },
  { id: 2, name: 'Bob Smith', progress: 45, lastActive: '1 day ago', language: 'French' },
  { id: 3, name: 'Charlie Brown', progress: 90, lastActive: '5 mins ago', language: 'German' },
  { id: 4, name: 'Diana Prince', progress: 30, lastActive: '3 days ago', language: 'Spanish' },
  { id: 5, name: 'Evan Wright', progress: 60, lastActive: '1 week ago', language: 'Arabic' },
];

const initialSessions = [
  { id: 1, topic: 'Spanish Conversation Practice', time: 'Today, 2:00 PM', attendees: 3 },
  { id: 2, topic: 'French Grammar Q&A', time: 'Tomorrow, 10:00 AM', attendees: 5 },
];

export default function TeacherClient() {
  const { t } = useLanguage();
  const router = useRouter();
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');
  const [assignmentTopic, setAssignmentTopic] = useState('');
  const [sessions] = useState(initialSessions);
  const [assignStudentId, setAssignStudentId] = useState<string>('');

  const handleSendFeedback = (studentId: number) => {
    alert(`Feedback sent to student ${studentId}: ${feedback}`);
    setFeedback('');
    setSelectedStudent(null);
  };

  const handleAssignLesson = () => {
      if (!assignStudentId || !assignmentTopic) {
          alert('Please select a student and enter a topic.');
          return;
      }
      alert(`Lesson "${assignmentTopic}" assigned to student ${assignStudentId}`);
      setAssignmentTopic('');
      setAssignStudentId('');
  };
  
  const handleHostSession = () => {
      const sessionId = uuidv4();
      router.push(`/live-session/${sessionId}`);
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
                    <Button onClick={handleAssignLesson}>{t('assignLesson')}</Button> 
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="live-sessions" className="space-y-4">
             <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">{t('upcomingSessions')}</h2>
                <Button onClick={handleHostSession}>{t('hostSession')}</Button>
             </div>
             <div className="grid gap-4">
                {sessions.map(session => (
                    <Card key={session.id}>
                        <CardHeader>
                            <CardTitle>{session.topic}</CardTitle>
                            <CardDescription>{session.time}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p>{session.attendees} students attending</p>
                            <Button className="mt-2" variant="outline">{t('startSession')}</Button>
                        </CardContent>
                    </Card>
                ))}
             </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
