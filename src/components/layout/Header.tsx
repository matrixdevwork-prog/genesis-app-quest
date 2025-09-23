import React from 'react';
import { Bell, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const Header: React.FC = () => {
  // TODO: Replace with actual user data from auth context
  const user = {
    name: 'John Doe',
    avatar: '',
    credits: 150,
  };

  const unreadNotifications = 3;

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-primary">Sub4Sub</h1>
        </div>

        <div className="flex items-center space-x-4">
          {/* Credits Display */}
          <div className="hidden sm:flex items-center space-x-2">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              {user.credits} Credits
            </Badge>
          </div>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadNotifications > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs bg-destructive">
                {unreadNotifications}
              </Badge>
            )}
          </Button>

          {/* User Avatar */}
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
};

export default Header;