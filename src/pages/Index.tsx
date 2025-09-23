import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            Sub4Sub
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8">
            Grow your YouTube channel with our credit-based engagement platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <a href="/signup">Get Started</a>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href="/login">Sign In</a>
            </Button>
          </div>
        </div>
        
        <div className="mt-16 grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center p-6 rounded-lg bg-card border">
            <h3 className="text-lg font-semibold mb-2">Earn Credits</h3>
            <p className="text-muted-foreground">Watch, like, and subscribe to earn credits for promoting your content</p>
          </div>
          <div className="text-center p-6 rounded-lg bg-card border">
            <h3 className="text-lg font-semibold mb-2">Promote Content</h3>
            <p className="text-muted-foreground">Use credits to get real engagement on your YouTube videos</p>
          </div>
          <div className="text-center p-6 rounded-lg bg-card border">
            <h3 className="text-lg font-semibold mb-2">Track Progress</h3>
            <p className="text-muted-foreground">Monitor your growth with detailed analytics and leaderboards</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
