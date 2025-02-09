import { Link } from "react-router";

import { Button } from "~/components/ui/button";

const Index = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h1 className="text-4xl font-bold">Welcome to the Fair Interviews Platform</h1>
      <Button asChild size="lg">
        <Link to="/auth/magic-link">Get magic link</Link>
      </Button>
    </div>
  );
};

export default Index;
