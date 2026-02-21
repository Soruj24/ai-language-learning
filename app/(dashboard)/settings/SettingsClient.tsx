'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { useLanguage } from '@/app/lib/i18n/LanguageContext';
import { Bell, BellOff } from 'lucide-react';
import { useState } from 'react';

export default function SettingsClient() {
  const { t, learningLanguage } = useLanguage();
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        return true;
    }
    return false;
  });

  const toggleNotifications = async () => {
    if (notificationsEnabled) {
        setNotificationsEnabled(false);
    } else {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                setNotificationsEnabled(true);
                new Notification('Notifications Enabled', {
                    body: 'You will now receive daily reminders!',
                    icon: '/globe.svg'
                });
            }
        }
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('settings')}</h1>
        <p className="text-muted-foreground">{t('manageAccount')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('profileInfo')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">{t('name')}</Label>
            <Input id="name" placeholder={t('yourName')} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">{t('email')}</Label>
            <Input id="email" type="email" placeholder="email@example.com" disabled />
          </div>
          <Button>{t('saveChanges')}</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('learningPreferences')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>{t('targetLanguage')}</Label>
            <Button variant="outline">{learningLanguage}</Button>
          </div>
           <div className="flex items-center justify-between">
            <Label>{t('dailyGoal')}</Label>
            <Button variant="outline">{t('minutes15')}</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Daily Reminders</Label>
            <Button variant={notificationsEnabled ? "default" : "outline"} onClick={toggleNotifications}>
              {notificationsEnabled ? <Bell className="mr-2 h-4 w-4" /> : <BellOff className="mr-2 h-4 w-4" />}
              {notificationsEnabled ? 'Enabled' : 'Disabled'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
