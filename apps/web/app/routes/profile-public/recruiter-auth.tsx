import { Loader2Icon } from 'lucide-react';
import {
  Form,
  redirect,
  useActionData,
  useLoaderData,
  useNavigation,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from 'react-router';

import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { cn } from '~/lib/utils';
import * as profileService from '~/services/profile.server';
import * as authService from '~/services/auth.server';
import { commitSession, getSession } from '~/lib/sessions.server';

interface ActionData {
  error?: string;
}

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const session = await getSession(request.headers.get('Cookie'));
  const userId = session.get('userId');
  if (userId) {
    return redirect('/me');
  }

  const { nameSlug } = params;
  if (!nameSlug || !nameSlug.startsWith('@')) {
    return redirect('/');
  }

  const profile = await profileService.getProfileByPublishedLink(
    nameSlug.slice(1)
  );
  if (!profile) {
    return redirect('/');
  }

  return { profile };
};

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

const RecruiterMagicLink = () => {
  const navigation = useNavigation();
  const actionData = useActionData() as ActionData;
  const { profile } = useLoaderData<typeof loader>();
  const isSubmitting = navigation.state === 'submitting';

  return (
    <div className="flex items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
      <div className="w-full max-w-wd mx-auto">
        <div className="px-4 py-6 sm:px-8 sm:py-8 space-y-6">
          <div className="space-y-3 text-center">
            <div className="space-y-2">
              <p className="text-2xl sm:text-xl font-semibold text-gray-800 dark:text-gray-200">
                Book an interview with {profile.name}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 max-w-sm mx-auto">
                Enter your email to receive a secure magic link for booking the
                interview.
              </p>
            </div>
          </div>

          <Form method="post" className="space-y-6" noValidate>
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Work Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@company.com"
                className={cn(
                  'w-full h-11 text-base sm:text-sm',
                  actionData?.error &&
                    'border-red-300 focus:ring-red-500 focus:border-red-500'
                )}
                disabled={isSubmitting}
                aria-describedby={actionData?.error ? 'email-error' : undefined}
              />
              {actionData?.error && (
                <p
                  className="mt-2 text-sm text-red-600 dark:text-red-400"
                  id="email-error"
                >
                  {actionData.error}
                </p>
              )}
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full h-11 text-base sm:text-sm"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  Sending magic link...
                </>
              ) : (
                'Send magic link'
              )}
            </Button>

            <div className="space-y-4 text-center text-sm">
              <div className="text-gray-600 dark:text-gray-400 space-y-1">
                <p>By continuing, you agree to our</p>
                <p className="space-x-1">
                  <a
                    href="/terms"
                    className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
                  >
                    Terms of Service
                  </a>
                  <span>and</span>
                  <a
                    href="/privacy"
                    className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
                  >
                    Privacy Policy
                  </a>
                </p>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                We'll send you a secure magic link to continue with the booking
                process.
              </p>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default RecruiterMagicLink;
