import { format } from 'date-fns';
import {
  CalendarIcon,
  ClockIcon,
  DollarSignIcon,
  MapPinIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserIcon,
  ArrowRightIcon,
} from 'lucide-react';
import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';
import { Form, redirect, useLoaderData, useNavigation } from 'react-router';

import { InterviewStatus, PaymentStatus } from '@prisma/client';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "~/components/ui/tabs";
import { Avatar, AvatarFallback } from '~/components/ui/avatar';
import prisma from '~/lib/prisma.server';
import { getSession } from '~/lib/sessions.server';
import { cn } from '~/lib/utils';

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get('Cookie'));
  if (!session?.get('userId')) {
    return redirect('/auth/login');
  }

  const interviews = await prisma.interview.findMany({
    where: {
      candidateId: session.get('userId'),
    },
    include: {
      recruiter: true,
      payment: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const stats = {
    total: interviews.length,
    pending: interviews.filter(i => i.status === InterviewStatus.PENDING).length,
    completed: interviews.filter(i => i.status === InterviewStatus.COMPLETED).length,
    totalEarned: interviews
      .filter(i => i.payment?.status === PaymentStatus.RELEASED)
      .reduce((sum, i) => sum + (i.payment?.amount || 0), 0),
  };

  return { interviews, stats };
}

export async function action({ request }: ActionFunctionArgs) {
  const session = await getSession(request.headers.get('Cookie'));
  if (!session?.get('userId')) {
    return redirect('/auth/login');
  }

  const formData = await request.formData();
  const interviewId = formData.get('interviewId');

  if (!interviewId) {
    return redirect('/me/interviews');
  }

  await prisma.interview.update({
    where: { id: interviewId as string },
    data: { status: InterviewStatus.COMPLETED },
  });

  await prisma.payment.update({
    where: { interviewId: interviewId as string },
    data: { status: PaymentStatus.RELEASED },
  });

  return redirect('/me/interviews');
}

export default function Interviews() {
  const { interviews, stats } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  if (interviews.length === 0) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              Interviews
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Track and manage your interview sessions
            </p>
          </div>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <CalendarIcon className="h-12 w-12 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No interviews yet
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-6">
              When recruiters schedule interviews with you, they will appear here. Make sure your profile is complete and published to start receiving interview requests.
            </p>
            <Button asChild>
              <a href="/me/profile">Complete Your Profile</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Interviews
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Track and manage your interview sessions
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Interviews</CardTitle>
            <CalendarIcon className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <ClockIcon className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircleIcon className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
            <DollarSignIcon className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalEarned.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Interviews</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <InterviewList
            interviews={interviews}
            isSubmitting={isSubmitting}
          />
        </TabsContent>

        <TabsContent value="pending" className="mt-6">
          <InterviewList
            interviews={interviews.filter(i => i.status === InterviewStatus.PENDING)}
            isSubmitting={isSubmitting}
          />
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <InterviewList
            interviews={interviews.filter(i => i.status === InterviewStatus.COMPLETED)}
            isSubmitting={isSubmitting}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface InterviewListProps {
  interviews: any[];
  isSubmitting: boolean;
}

function InterviewList({ interviews, isSubmitting }: InterviewListProps) {
  if (interviews.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-gray-500">
          No interviews found
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {interviews.map((interview) => (
        <Card key={interview.id}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    {interview.recruiter.email.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">
                      Interview with {interview.recruiter.email}
                    </h3>
                    <Badge variant={interview.status === InterviewStatus.COMPLETED ? 'default' : 'secondary'}>
                      {interview.status === InterviewStatus.COMPLETED ? 'Completed' : 'Pending'}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="h-4 w-4" />
                      <span>{format(new Date(interview.createdAt), 'PPP')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ClockIcon className="h-4 w-4" />
                      <span>60 minutes</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPinIcon className="h-4 w-4" />
                      <span>Remote</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSignIcon className="h-4 w-4" />
                      <span>${interview.payment?.amount || 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              {interview.status === InterviewStatus.PENDING && (
                <Form method="post">
                  <input type="hidden" name="interviewId" value={interview.id} />
                  <Button
                    type="submit"
                    variant="outline"
                    className="gap-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      'Confirming...'
                    ) : (
                      <>
                        Confirm Completion
                        <ArrowRightIcon className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </Form>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
