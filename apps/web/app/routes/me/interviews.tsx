import { type LoaderFunctionArgs, redirect } from 'react-router';
import { useLoaderData } from 'react-router';
import { format } from 'date-fns';
import { CalendarIcon, ClockIcon, DollarSignIcon, MapPinIcon } from 'lucide-react';

import { getSession } from '~/lib/sessions.server';
import prisma from '~/lib/prisma.server';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get('Cookie'));
  if (!session?.get('userId')) {
    return redirect('/auth/magic-link');
  }

  const interviews = await prisma.interview.findMany({
    where: {
      candidateId: session.get('userId'),
    },
    include: {
      recruiter: true,
      candidate: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return { interviews };
}

export default function Interviews() {
  const { interviews } = useLoaderData<typeof loader>();

  if (interviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4 px-4">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            No interviews yet
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-sm">
            When recruiters schedule interviews with you, they will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          My Interviews
        </h1>
        <Badge variant="secondary" className="text-sm">
          {interviews.length} {interviews.length === 1 ? 'Interview' : 'Interviews'}
        </Badge>
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {interviews.map((interview) => (
          <Card key={interview.id} className="flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-start justify-between">
                <span className="text-lg font-semibold">
                  Interview with {interview.recruiter.email}
                </span>
              </CardTitle>
              <CardDescription>
                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                  <CalendarIcon className="h-4 w-4" />
                  <span>{format(new Date(interview.createdAt), 'PPP')}</span>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sm">
                  <ClockIcon className="h-4 w-4 text-gray-500" />
                  <span>60 minutes</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <MapPinIcon className="h-4 w-4 text-gray-500" />
                  <span>Remote</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <DollarSignIcon className="h-4 w-4 text-gray-500" />
                  <span>$150 USD</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <Button variant="outline" className="w-full">
                View Details
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
