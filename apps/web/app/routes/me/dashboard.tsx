import { Link } from 'react-router';
import { type LoaderFunctionArgs, redirect } from 'react-router';
import { useLoaderData } from 'react-router';
import { CalendarIcon, UserIcon, WalletIcon, CheckCircleIcon, XCircleIcon } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { getSession } from '~/lib/sessions.server';
import prisma from '~/lib/prisma.server';
import { cn } from '~/lib/utils';

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get('Cookie'));
  if (!session?.get('userId')) {
    return redirect('/auth/login');
  }

  const userId = session.get('userId');

  const [profile, interviews, totalEarnings] = await Promise.all([
    prisma.profile.findUnique({
      where: { userId },
    }),
    prisma.interview.findMany({
      where: { candidateId: userId },
      include: {
        recruiter: true,
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.payment.aggregate({
      where: {
        interview: {
          candidateId: userId,
        },
        status: 'RELEASED',
      },
      _sum: {
        amount: true,
      },
    }),
  ]);

  const profileCompletionSteps = [
    { label: 'Basic Info', completed: Boolean(profile?.name && profile?.role) },
    { label: 'Experience', completed: Boolean(profile?.yearsOfExperience && profile?.location) },
    { label: 'Interview Rate', completed: Boolean(profile?.interviewRate && profile?.interviewRateCurrency) },
    { label: 'Published Profile', completed: Boolean(profile?.isPublished) },
  ];

  const completedSteps = profileCompletionSteps.filter(step => step.completed).length;
  const completionPercentage = (completedSteps / profileCompletionSteps.length) * 100;

  return {
    profile,
    interviews,
    totalEarnings: totalEarnings._sum.amount || 0,
    profileCompletionSteps,
    completionPercentage,
  };
}

export default function Dashboard() {
  const { profile, interviews, totalEarnings, profileCompletionSteps, completionPercentage } = useLoaderData<typeof loader>();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Welcome back{profile?.name ? `, ${profile.name}` : ''}!
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Here's what's happening with your interviews
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <WalletIcon className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalEarnings.toFixed(2)}</div>
            <p className="text-xs text-gray-500">From completed interviews</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Upcoming Interviews</CardTitle>
            <CalendarIcon className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{interviews.filter(i => i.status === 'PENDING').length}</div>
            <p className="text-xs text-gray-500">Scheduled interviews</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Profile Completion</CardTitle>
            <UserIcon className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionPercentage.toFixed(0)}%</div>
            <div className="mt-4 space-y-2">
              {profileCompletionSteps.map((step, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  {step.completed ? (
                    <CheckCircleIcon className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircleIcon className="w-4 h-4 text-gray-300" />
                  )}
                  <span className={cn(
                    "text-sm",
                    step.completed ? "text-gray-700 dark:text-gray-300" : "text-gray-500 dark:text-gray-400"
                  )}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Interviews</CardTitle>
          <CardDescription>Your latest interview activities</CardDescription>
        </CardHeader>
        <CardContent>
          {interviews.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-gray-500 dark:text-gray-400">No interviews yet</p>
              {!profile?.isPublished && (
                <Button asChild className="mt-4">
                  <Link to="/me/profile">Complete your profile</Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {interviews.map((interview) => (
                <div
                  key={interview.id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="space-y-1">
                    <p className="font-medium">
                      Interview with {interview.recruiter.email}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(interview.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      ${interview.payment?.amount || 0}
                    </div>
                    <div className={cn(
                      "text-xs",
                      interview.status === 'COMPLETED' ? "text-green-500" : "text-blue-500"
                    )}>
                      {interview.status === 'COMPLETED' ? 'Completed' : 'Pending'}
                    </div>
                  </div>
                </div>
              ))}
              {interviews.length > 0 && (
                <Button variant="outline" asChild className="w-full mt-4">
                  <Link to="/me/interviews">View all interviews</Link>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}