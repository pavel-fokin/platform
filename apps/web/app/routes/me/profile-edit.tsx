import { ArrowLeftIcon, Loader2Icon } from 'lucide-react';
import {
  Form,
  Link,
  useActionData,
  useNavigation,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  redirect,
  useLoaderData,
} from 'react-router';
import { z } from 'zod';

import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
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

  await profileService.updateProfile(userId, validatedData.data);
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
    <div className="max-w-2xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center gap-6 mb-8">
        <Button variant="ghost" size="icon" asChild className="shrink-0">
          <Link to="/me/profile">
            <ArrowLeftIcon className="h-5 w-5" />
            <span className="sr-only">Back to Profile</span>
          </Link>
        </Button>
        <div className="flex-grow">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Edit Profile
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Update your profile information visible to recruiters
          </p>
        </div>
      </div>

      <Form method="patch" className="space-y-8">
        {/* Basic Information */}
        <div className="space-y-4">
          <div className="border-b pb-2">
            <h2 className="font-medium">Basic Information</h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                defaultValue={profile?.name}
                placeholder="John Doe"
                aria-describedby={getFieldError('name') ? 'name-error' : undefined}
                className={cn(getFieldError('name') && 'border-red-500')}
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
                className={cn(getFieldError('role') && 'border-red-500')}
              />
              {getFieldError('role') && (
                <p id="role-error" className="text-sm text-red-600">
                  {getFieldError('role')}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Experience & Location */}
        <div className="space-y-4">
          <div className="border-b pb-2">
            <h2 className="font-medium">Experience & Location</h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
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
                className={cn(getFieldError('yearsOfExperience') && 'border-red-500')}
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
                className={cn(getFieldError('location') && 'border-red-500')}
              />
              {getFieldError('location') && (
                <p id="location-error" className="text-sm text-red-600">
                  {getFieldError('location')}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Interview Rate */}
        <div className="space-y-4">
          <div className="border-b pb-2">
            <h2 className="font-medium">Interview Rate</h2>
          </div>

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
                    getFieldError('interviewRate') && 'border-red-500'
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
              <Select
                name="interviewRateCurrency"
                defaultValue={profile?.interviewRateCurrency}
              >
                <SelectTrigger
                  id="interviewRateCurrency"
                  className={cn(getFieldError('interviewRateCurrency') && 'border-red-500')}
                  aria-describedby={getFieldError('interviewRateCurrency') ? 'currency-error' : undefined}
                >
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.value} value={currency.value}>
                      {currency.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {getFieldError('interviewRateCurrency') && (
                <p id="currency-error" className="text-sm text-red-600">
                  {getFieldError('interviewRateCurrency')}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-between pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            asChild
          >
            <Link to="/me/profile">Cancel</Link>
          </Button>

          <div className="flex items-center gap-3">
            {actionData?.success && (
              <p className="text-sm text-green-600 dark:text-green-400">
                Profile updated successfully
              </p>
            )}
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
          </div>
        </div>
      </Form>
    </div>
  );
}
