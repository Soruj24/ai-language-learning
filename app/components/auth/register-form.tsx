'use client'

import { useActionState, useState } from 'react';
import { register } from '@/app/lib/actions-register';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { User, Mail, Lock, Languages, BarChart } from 'lucide-react';
import { cn } from '@/app/lib/utils';

export function RegisterForm() {
  const [errorMessage, formAction, isPending] = useActionState(
    register,
    undefined,
  );
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordsMatch, setPasswordsMatch] = useState(true);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (confirmPassword) {
      setPasswordsMatch(e.target.value === confirmPassword);
    }
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    setPasswordsMatch(password === e.target.value);
  };

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-gray-300">Full Name</Label>
        <div className="relative">
          <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
          <Input 
            id="name" 
            name="name" 
            type="text" 
            required 
            placeholder="John Doe" 
            className="pl-10 bg-[#1F2937]/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-indigo-500 focus:ring-indigo-500/20"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email" className="text-gray-300">Email Address</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
          <Input 
            id="email" 
            name="email" 
            type="email" 
            required 
            placeholder="name@example.com" 
            className="pl-10 bg-[#1F2937]/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-indigo-500 focus:ring-indigo-500/20"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="password" className="text-gray-300">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
            <Input 
              id="password" 
              name="password" 
              type="password" 
              required 
              minLength={6} 
              placeholder="••••••••"
              onChange={handlePasswordChange}
              className="pl-10 bg-[#1F2937]/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-indigo-500 focus:ring-indigo-500/20"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="confirm-password" className="text-gray-300">Confirm Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
            <Input 
              id="confirm-password" 
              name="confirmPassword" 
              type="password" 
              required 
              placeholder="••••••••"
              onChange={handleConfirmPasswordChange}
              className={cn(
                "pl-10 bg-[#1F2937]/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-indigo-500 focus:ring-indigo-500/20",
                !passwordsMatch && confirmPassword && "border-red-500 focus:border-red-500 focus:ring-red-500/20"
              )}
            />
          </div>
          {!passwordsMatch && confirmPassword && (
            <p className="text-xs text-red-400">Passwords do not match</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="language" className="text-gray-300">Target Language</Label>
          <div className="relative">
            <Languages className="absolute left-3 top-2.5 h-5 w-5 text-gray-500 z-10 pointer-events-none" />
            <Select name="targetLanguage" defaultValue="spanish">
              <SelectTrigger className="pl-10 bg-[#1F2937]/50 border-gray-700 text-white focus:ring-indigo-500/20">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent className="bg-[#1F2937] border-gray-700 text-white">
                <SelectItem value="spanish">Spanish</SelectItem>
                <SelectItem value="french">French</SelectItem>
                <SelectItem value="german">German</SelectItem>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="chinese">Chinese</SelectItem>
                <SelectItem value="japanese">Japanese</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="level" className="text-gray-300">Current Level</Label>
          <div className="relative">
            <BarChart className="absolute left-3 top-2.5 h-5 w-5 text-gray-500 z-10 pointer-events-none" />
            <Select name="level" defaultValue="beginner">
              <SelectTrigger className="pl-10 bg-[#1F2937]/50 border-gray-700 text-white focus:ring-indigo-500/20">
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent className="bg-[#1F2937] border-gray-700 text-white">
                <SelectItem value="beginner">Beginner (A1-A2)</SelectItem>
                <SelectItem value="intermediate">Intermediate (B1-B2)</SelectItem>
                <SelectItem value="advanced">Advanced (C1-C2)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Button 
        type="submit" 
        disabled={isPending || !passwordsMatch} 
        className={cn(
          "w-full h-11 mt-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-lg shadow-lg shadow-indigo-600/20 transition-all",
          (isPending || !passwordsMatch) && "opacity-70 cursor-not-allowed"
        )}
      >
        {isPending ? (
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Creating account...</span>
          </div>
        ) : 'Create Account'}
      </Button>
      
      {errorMessage && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
          {errorMessage}
        </div>
      )}
    </form>
  );
}
