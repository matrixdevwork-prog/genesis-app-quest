import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Users, Trophy, Star } from 'lucide-react';

const Index: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Grow Your YouTube Channel with 
              <span className="text-primary"> Sub For Sub</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Connect with fellow creators, earn credits by supporting others, 
              and promote your own content to reach new audiences.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Button asChild size="lg" className="text-lg px-8">
                  <Link to="/dashboard">Go to Dashboard</Link>
                </Button>
              ) : (
                <>
                  <Button asChild size="lg" className="text-lg px-8">
                    <Link to="/signup">Get Started Free</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="text-lg px-8">
                    <Link to="/login">Sign In</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How Sub For Sub Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A simple three-step process to grow your YouTube channel organically
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Play className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Complete Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Watch videos, like content, and subscribe to channels from other creators. 
                  Earn credits for each completed task.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto h-16 w-16 rounded-full bg-secondary/10 flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-secondary" />
                </div>
                <CardTitle>Promote Your Content</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Use your earned credits to create promotion campaigns for your own videos. 
                  Reach real, engaged audiences.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto h-16 w-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
                  <Trophy className="h-8 w-8 text-success" />
                </div>
                <CardTitle>Grow & Earn</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Watch your subscriber count, views, and engagement grow organically. 
                  Unlock achievements and level up your creator status.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Join Thousands of Growing Creators
            </h2>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">10,000+</div>
              <div className="text-muted-foreground">Active Creators</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-secondary mb-2">500K+</div>
              <div className="text-muted-foreground">Tasks Completed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-success mb-2">2M+</div>
              <div className="text-muted-foreground">Views Generated</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-warning mb-2">100K+</div>
              <div className="text-muted-foreground">New Subscribers</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <Star className="h-16 w-16 text-primary mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Ready to Grow Your Channel?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join Sub For Sub today and start connecting with fellow creators who want to grow together.
            </p>
            {!user && (
              <Button asChild size="lg" className="text-lg px-8">
                <Link to="/signup">Start Growing Today</Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center text-muted-foreground">
            <p>&copy; 2024 Sub For Sub. All rights reserved.</p>
            <div className="flex justify-center gap-6 mt-4">
              <Link to="/terms" className="hover:text-foreground">Terms of Service</Link>
              <Link to="/privacy" className="hover:text-foreground">Privacy Policy</Link>
              <Link to="/contact" className="hover:text-foreground">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
