import React from 'react';

const Signup: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">Create Account</h1>
          <p className="mt-2 text-muted-foreground">Join Sub4Sub and start growing your channel</p>
        </div>
        {/* Signup form will be implemented in Phase 4 */}
        <div className="text-center text-muted-foreground">
          Signup form coming in Phase 4
        </div>
      </div>
    </div>
  );
};

export default Signup;