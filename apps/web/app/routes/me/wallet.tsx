import { format } from 'date-fns';
import { type LoaderFunctionArgs, type ActionFunctionArgs, redirect } from 'react-router';
import { Form, useLoaderData, useNavigation } from 'react-router';
import {
  BanknoteIcon,
  ArrowDownIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  UserIcon,
  ArrowRightIcon,
} from 'lucide-react';

import { PaymentStatus } from '@prisma/client';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
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

  const payments = await prisma.payment.findMany({
    where: {
      interview: {
        candidateId: session.get('userId'),
      },
    },
    include: {
      interview: {
        include: {
          recruiter: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const stats = {
    totalBalance: payments
      .filter(p => p.status === PaymentStatus.RELEASED)
      .reduce((sum, p) => sum + p.amount, 0),
    pendingBalance: payments
      .filter(p => p.status === PaymentStatus.ESCROW)
      .reduce((sum, p) => sum + p.amount, 0),
    totalEarned: payments
      .filter(p => p.status === PaymentStatus.RELEASED || p.status === PaymentStatus.ESCROW)
      .reduce((sum, p) => sum + p.amount, 0),
    completedPayments: payments.filter(p => p.status === PaymentStatus.RELEASED).length,
  };

  return { payments, stats };
}

export async function action({ request }: ActionFunctionArgs) {
  const session = await getSession(request.headers.get('Cookie'));
  if (!session?.get('userId')) {
    return redirect('/auth/login');
  }

  // TODO: Implement actual withdrawal logic
  return redirect('/me/wallet');
}

export default function Wallet() {
  const { payments, stats } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isWithdrawing = navigation.state === 'submitting';

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Wallet
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage your earnings and withdrawals
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <BanknoteIcon className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalBalance.toFixed(2)}</div>
            <p className="text-xs text-gray-500">Ready to withdraw</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <ClockIcon className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.pendingBalance.toFixed(2)}</div>
            <p className="text-xs text-gray-500">In escrow</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
            <CheckCircleIcon className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalEarned.toFixed(2)}</div>
            <p className="text-xs text-gray-500">Lifetime earnings</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CalendarIcon className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedPayments}</div>
            <p className="text-xs text-gray-500">Paid interviews</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>Your recent payments and withdrawals</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="available">Available</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-4">
                <TransactionList
                  payments={payments}
                />
              </TabsContent>

              <TabsContent value="available" className="mt-4">
                <TransactionList
                  payments={payments.filter(p => p.status === PaymentStatus.RELEASED)}
                />
              </TabsContent>

              <TabsContent value="pending" className="mt-4">
                <TransactionList
                  payments={payments.filter(p => p.status === PaymentStatus.ESCROW)}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Withdraw Funds</CardTitle>
            <CardDescription>Transfer your earnings to your bank account</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <BanknoteIcon className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Available to withdraw</p>
                  <p className="text-2xl font-bold">${stats.totalBalance.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Form method="post" className="w-full">
              <Button
                type="submit"
                size="lg"
                className="w-full gap-2"
                disabled={stats.totalBalance === 0 || isWithdrawing}
              >
                {isWithdrawing ? (
                  'Processing...'
                ) : (
                  <>
                    Withdraw to Bank Account
                    <ArrowDownIcon className="w-4 h-4" />
                  </>
                )}
              </Button>
            </Form>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

interface TransactionListProps {
  payments: any[];
}

function TransactionList({ payments }: TransactionListProps) {
  if (payments.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        No transactions found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {payments.map((payment) => (
        <div
          key={payment.id}
          className="flex items-start justify-between p-4 rounded-lg border"
        >
          <div className="flex items-start gap-4">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-blue-100 text-blue-600">
                {payment.interview.recruiter.email.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="font-medium">
                  Interview with {payment.interview.recruiter.email}
                </p>
                <Badge variant={payment.status === PaymentStatus.RELEASED ? 'default' : 'secondary'}>
                  {payment.status === PaymentStatus.RELEASED ? 'Completed' : 'Pending'}
                </Badge>
              </div>
              <p className="text-sm text-gray-500">
                {format(new Date(payment.createdAt), 'PPP')}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-medium">${payment.amount.toFixed(2)}</p>
            <p className="text-sm text-gray-500">USD</p>
          </div>
        </div>
      ))}
    </div>
  );
}
