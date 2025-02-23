import { Form, redirect, type ActionFunctionArgs, type LoaderFunctionArgs, useActionData, useLoaderData, useNavigation } from 'react-router';
import { z } from 'zod';
import { Loader2Icon, ArrowLeftIcon } from 'lucide-react';

import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '~/components/ui/card';
import { getSession } from '~/lib/sessions.server';
import * as profileService from '~/services/profile.server';
import { cn } from '~/lib/utils';

const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  role: z.string().min(1, 'Role is required'),
  yearsOfExperience: z.coerce.number().min(1, 'Years of experience must be at least 1'),
  location: z.string().min(1, 'Location is required'),
  interviewRate: z.coerce.number().min(1, 'Interview rate must be at least 1'),
  interviewRateCurrency: z.enum(['USD', 'EUR', 'GBP'], {
    errorMap: () => ({ message: 'Please select a valid currency' }),
  }),
});

type UpdateProfile = z.infer<typeof updateProfileSchema>;
type ActionData = { errors?: z.ZodError; success?: boolean };

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const session = await getSession(request.headers.get('Cookie'));
  const userId = session.get('userId');
  if (!userId) {
    return redirect('/auth/login');
  }

  const profile = await profileService.getProfileByUserId(userId);
  return { profile };
};

export async function action({ request }: ActionFunctionArgs) {
  const session = await getSession(request.headers.get('Cookie'));
  if (!session?.get('userId')) {
    return redirect('/auth/login');
  }

  const formData = await request.formData();
  const data = Object.fromEntries(formData);

  const validatedData = updateProfileSchema.safeParse(data);
  if (!validatedData.success) {
    return { errors: validatedData.error };
  }

  const userId = session.get('userId');
  if (!userId) {
    return redirect('/auth/login');
  }

  await profileService.updateProfile(
    userId,
    validatedData.data
  );

  return { success: true };
}

const currencies = [
  { value: 'USD', label: 'US Dollar ($)', symbol: '$' },
  { value: 'EUR', label: 'Euro (€)', symbol: '€' },
  { value: 'GBP', label: 'British Pound (£)', symbol: '£' },
];

export default function EditProfile() {
  const { profile } = useLoaderData<typeof loader>();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  const getFieldError = (field: keyof UpdateProfile) =>
    actionData?.errors?.formErrors.fieldErrors[field]?.[0];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <a href="/me/profile">
              <ArrowLeftIcon className="h-4 w-4" />
              <span className="sr-only">Back to Profile</span>
            </a>
          </Button>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Edit Profile
          </h1>
        </div>
        {actionData?.success && (
          <p className="text-sm text-green-600 dark:text-green-400">
            Profile updated successfully
          </p>
        )}
      </div>

      <Card>
        <Form method="patch" className="space-y-6">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Update your profile information visible to recruiters
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={profile?.name}
                  placeholder="John Doe"
                  aria-describedby={getFieldError('name') ? 'name-error' : undefined}
                  className={getFieldError('name') ? 'border-red-500' : ''}
                />
                {getFieldError('name') && (
                  <p id="name-error" className="text-sm text-red-600">
                    {getFieldError('name')}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input
                  id="role"
                  name="role"
                  defaultValue={profile?.role}
                  placeholder="Senior Software Engineer"
                  aria-describedby={getFieldError('role') ? 'role-error' : undefined}
                  className={getFieldError('role') ? 'border-red-500' : ''}
                />
                {getFieldError('role') && (
                  <p id="role-error" className="text-sm text-red-600">
                    {getFieldError('role')}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                <Input
                  id="yearsOfExperience"
                  name="yearsOfExperience"
                  type="number"
                  min="1"
                  defaultValue={profile?.yearsOfExperience}
                  placeholder="5"
                  aria-describedby={getFieldError('yearsOfExperience') ? 'experience-error' : undefined}
                  className={getFieldError('yearsOfExperience') ? 'border-red-500' : ''}
                />
                {getFieldError('yearsOfExperience') && (
                  <p id="experience-error" className="text-sm text-red-600">
                    {getFieldError('yearsOfExperience')}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  defaultValue={profile?.location}
                  placeholder="San Francisco, CA"
                  aria-describedby={getFieldError('location') ? 'location-error' : undefined}
                  className={getFieldError('location') ? 'border-red-500' : ''}
                />
                {getFieldError('location') && (
                  <p id="location-error" className="text-sm text-red-600">
                    {getFieldError('location')}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Interview Rate</h3>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="interviewRate">Rate per Hour</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <Input
                      id="interviewRate"
                      name="interviewRate"
                      type="number"
                      min="1"
                      defaultValue={profile?.interviewRate}
                      placeholder="150"
                      className={cn(
                        "pl-7",
                        getFieldError('interviewRate') ? 'border-red-500' : ''
                      )}
                      aria-describedby={getFieldError('interviewRate') ? 'rate-error' : undefined}
                    />
                  </div>
                  {getFieldError('interviewRate') && (
                    <p id="rate-error" className="text-sm text-red-600">
                      {getFieldError('interviewRate')}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="interviewRateCurrency">Currency</Label>
                  <select
                    id="interviewRateCurrency"
                    name="interviewRateCurrency"
                    defaultValue={profile?.interviewRateCurrency}
                    className={cn(
                      "w-full h-10 px-3 rounded-md border bg-background text-sm",
                      getFieldError('interviewRateCurrency') ? 'border-red-500' : ''
                    )}
                    aria-describedby={getFieldError('interviewRateCurrency') ? 'currency-error' : undefined}
                  >
                    <option value="">Select currency</option>
                    {currencies.map((currency) => (
                      <option key={currency.value} value={currency.value}>
                        {currency.label}
                      </option>
                    ))}
                  </select>
                  {getFieldError('interviewRateCurrency') && (
                    <p id="currency-error" className="text-sm text-red-600">
                      {getFieldError('interviewRateCurrency')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between items-center border-t pt-6">
            <Button
              variant="outline"
              type="button"
              asChild
            >
              <a href="/me/profile">Cancel</a>
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  Saving changes...
                </>
              ) : (
                'Save changes'
              )}
            </Button>
          </CardFooter>
        </Form>
      </Card>
    </div>
  );
}
