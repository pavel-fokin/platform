import { format } from 'date-fns';
import {
  CalendarIcon,
  ClockIcon,
  DollarSignIcon,
  MapPinIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  BriefcaseIcon,
} from 'lucide-react';
import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';
import { Form, redirect, useLoaderData, useNavigation } from 'react-router';

import { InterviewStatus, PaymentStatus } from '@prisma/client';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Avatar, AvatarFallback } from '~/components/ui/avatar';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "~/components/ui/tabs";
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

  return { interviews };
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
  const { interviews } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  if (interviews.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              Interviews
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Track and manage your interview sessions
            </p>
          </div>
        </div>

        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <BriefcaseIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No interviews yet
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6">
            When recruiters schedule interviews with you, they will appear here. Make sure your profile is complete and published to start receiving interview requests.
          </p>
          <Button asChild>
            <a href="/me/profile">Complete Your Profile</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Interviews
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Track and manage your interview sessions
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {interviews.length} {interviews.length === 1 ? 'Interview' : 'Interviews'}
        </Badge>
      </div>

      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg">
        <Tabs defaultValue="all" className="w-full">
          <div className="px-6 pt-4">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="all">All Interviews</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all" className="px-6">
            <InterviewList
              interviews={interviews}
              isSubmitting={isSubmitting}
            />
          </TabsContent>

          <TabsContent value="pending" className="px-6">
            <InterviewList
              interviews={interviews.filter(i => i.status === InterviewStatus.PENDING)}
              isSubmitting={isSubmitting}
            />
          </TabsContent>

          <TabsContent value="completed" className="px-6">
            <InterviewList
              interviews={interviews.filter(i => i.status === InterviewStatus.COMPLETED)}
              isSubmitting={isSubmitting}
            />
          </TabsContent>
        </Tabs>
      </div>
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
      <div className="text-center py-12 text-gray-500">
        No interviews found
      </div>
    );
  }

  return (
    <div className="py-4">
      {interviews.map((interview, index) => (
        <div
          key={interview.id}
          className={cn(
            "py-6 bg-white dark:bg-gray-800 rounded-lg",
            index > 0 && "mt-4"
          )}
        >
          <div className="px-6 flex items-start justify-between gap-4">
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
              <Form method="post" className="shrink-0">
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
        </div>
      ))}
    </div>
  );
}
