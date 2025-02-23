import type { LoaderFunctionArgs, ActionFunctionArgs } from 'react-router';
import { useLoaderData, Form, redirect } from 'react-router';

import { Button } from '~/components/ui/button';
import prisma from '~/lib/prisma.server';
import { getSession } from '~/lib/sessions.server';
import { PaymentStatus } from '@prisma/client';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const session = await getSession(request.headers.get('Cookie'));
  const userId = session.get('userId');
  const user = await prisma.user.findUnique({ where: { id: userId } });

  return { user };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const userId = formData.get('userId');
  const user = await prisma.user.findUnique({
    where: { id: userId as string },
  });

  if (!user) {
    return redirect('/');
  }

  const interview = await prisma.interview.create({
    data: {
      candidateId: user.id,
      recruiterId: user.id,
    },
  });

  await prisma.payment.create({
    data: {
      interviewId: interview.id,
      amount: 1000,
      currency: 'USD',
      status: PaymentStatus.ESCROW,
    },
  });

  return { user };
};

export default function Payment() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <h1 className="text-2xl font-bold">Payment for {user?.email}</h1>
      <Form method="post">
        <input type="hidden" name="userId" value={user?.id} />
        <Button size="lg">Pay</Button>
      </Form>
    </div>
  );
}
