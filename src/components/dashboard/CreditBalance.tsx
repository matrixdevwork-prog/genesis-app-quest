import React, { useState, useEffect } from 'react';
import { Coins, History, ArrowUp, ArrowDown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface Transaction {
  id: string;
  type: 'earned' | 'spent';
  amount: number;
  description: string;
  timestamp: Date;
}

interface CreditBalanceProps {
  balance: number;
  transactions?: Transaction[];
}

const CreditBalance: React.FC<CreditBalanceProps> = ({ 
  balance, 
  transactions = [] 
}) => {
  const [displayBalance, setDisplayBalance] = useState(0);
  const [showHistory, setShowHistory] = useState(false);

  // Animated counter effect
  useEffect(() => {
    const duration = 1000; // 1 second
    const steps = 60; // 60 fps
    const increment = balance / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= balance) {
        setDisplayBalance(balance);
        clearInterval(timer);
      } else {
        setDisplayBalance(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [balance]);

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-full">
            <Coins className="h-5 w-5 text-primary" />
          </div>
          Credit Balance
        </CardTitle>
        <CardDescription>Your available credits for promotions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-4xl font-bold text-primary animate-fade-in">
            {displayBalance.toLocaleString()}
          </div>
          <p className="text-sm text-muted-foreground">Available Credits</p>
        </div>

        <div className="flex gap-2">
          <Button size="sm" className="flex-1">
            Earn More
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-1"
          >
            <History className="h-4 w-4" />
            History
          </Button>
        </div>

        {showHistory && (
          <div className="space-y-3 animate-fade-in">
            <Separator />
            <div className="space-y-2 max-h-48 overflow-y-auto">
              <h4 className="text-sm font-medium">Recent Transactions</h4>
              {transactions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No transactions yet</p>
              ) : (
                transactions.slice(0, 5).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "p-1 rounded-full",
                        transaction.type === 'earned' 
                          ? "bg-success/10 text-success" 
                          : "bg-destructive/10 text-destructive"
                      )}>
                        {transaction.type === 'earned' ? (
                          <ArrowUp className="h-3 w-3" />
                        ) : (
                          <ArrowDown className="h-3 w-3" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{transaction.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {transaction.timestamp.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge 
                      variant={transaction.type === 'earned' ? 'default' : 'destructive'}
                      className="text-xs"
                    >
                      {transaction.type === 'earned' ? '+' : '-'}{transaction.amount}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CreditBalance;