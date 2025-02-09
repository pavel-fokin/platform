import { Form, redirect, type ActionFunctionArgs } from 'react-router';

import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { commitSession, getSession } from '~/lib/sessions.server';
import * as authService from '~/services/auth.server';

export const action = async ({ request }: ActionFunctionArgs) => {
  const session = await getSession(request.headers.get('Cookie'));

  const formData = await request.formData();
  const email = formData.get('email');

  const token = await authService.sendMagicLink(email as string);

  session.set('userId', token);

  return redirect('/me', {
    headers: {
      'Set-Cookie': await commitSession(session),
    },
  });
};

export default function MagicLink() {
  return (
    <main className="flex flex-col items-center justify-center h-screen px-6 sm:px-10 py-10 sm:py-20 space-y-10">
      <div className="max-w-md w-full space-y-4">
        <div className="flex flex-col items-center justify-center">
          <h2 className="text-center text-3xl font-extrabold">
            Fair Interviews
          </h2>
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            Enter your email to log in or create an account.
          </p>
        </div>
        <Form method="post">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="flex flex-col pt-4">
            <Button type="submit" size="lg" className="w-full">
              Send magic link
            </Button>
          </div>
        </Form>
        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          We’ll never share your email with anyone. Your information is secure.
        </p>
      </div>
    </main>
  );
}
