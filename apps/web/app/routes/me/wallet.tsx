import { type LoaderFunctionArgs, type ActionFunctionArgs, redirect } from 'react-router';
import { Form, useLoaderData } from 'react-router';
import { BanknoteIcon, ArrowDownIcon } from 'lucide-react';

import { PaymentStatus } from '@prisma/client';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '~/components/ui/card';
import prisma from '~/lib/prisma.server';
import { getSession } from '~/lib/sessions.server';

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
      status: PaymentStatus.RELEASED,
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

  const totalBalance = payments.reduce((sum, payment) => sum + payment.amount, 0);

  return { payments, totalBalance };
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
  const { payments, totalBalance } = useLoaderData<typeof loader>();

  return (
    <div className="space-y-8 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          My Wallet
        </h1>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Available Balance</CardTitle>
            <CardDescription>Your current balance from completed interviews</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline space-x-2">
              <BanknoteIcon className="h-6 w-6 text-green-500" />
              <span className="text-4xl font-bold">${totalBalance.toFixed(2)}</span>
              <span className="text-gray-500">USD</span>
            </div>
          </CardContent>
          <CardFooter>
            <Form method="post" className="w-full">
              <Button
                type="submit"
                className="w-full"
                disabled={totalBalance === 0}
              >
                <ArrowDownIcon className="mr-2 h-4 w-4" />
                Withdraw to Bank Account
              </Button>
            </Form>
          </CardFooter>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
            <CardDescription>Your latest interview payments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {payments.length === 0 ? (
                <p className="text-sm text-gray-500">No payments yet</p>
              ) : (
                payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">
                        Interview with {payment.interview.recruiter.email}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${payment.amount}</p>
                      <p className="text-sm text-green-500">Released</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
