import {
  Link,
  redirect,
  useLoaderData,
  type LoaderFunctionArgs,
} from 'react-router';

import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { MapPin } from 'lucide-react';
import * as profileService from '~/services/profile.server';
import { Button } from '~/components/ui/button';

export const loader = async ({ params }: LoaderFunctionArgs) => {
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

const PublishedProfile = () => {
  const { profile } = useLoaderData<typeof loader>();
  if (!profile) {
    return <div>Profile not found</div>;
  }

  return (
    <div className="flex flex-col space-y-10 p-4 items-center">
      <div className="grow flex flex-col space-y-4">
        <div className="flex flex-col items-center space-y-3">
          <Avatar className="w-28 h-28 shadow-lg">
            <AvatarImage src="https://media.licdn.com/dms/image/v2/C4E03AQHe_FQ5_2rBfQ/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1643380984309?e=1742428800&v=beta&t=Vb9pviEeko_74rKChMBRyy3O5EvtmYg9DqT41iPZhPw" />
            <AvatarFallback>PF</AvatarFallback>
          </Avatar>
        </div>
        <div className="flex flex-col items-center space-y-3">
          <h1 className="text-3xl sm:text-5xl font-bold leading-tight text-gray-900 dark:text-white">
            {profile.name}
          </h1>
          <p className="text-md sm:text-lg text-gray-700 dark:text-gray-300">
            {profile.role}
          </p>
          <p className="flex items-center text-md sm:text-lg text-gray-700 dark:text-gray-300">
            <MapPin className="w-5 h-5 inline-block mr-2" /> {profile.location}
          </p>
          <p
            className={
              'flex items-center text-md sm:text-lg text-gray-700 dark:text-gray-300'
            }
          >
            {profile.yearsOfExperience} YoE | ${profile.interviewRate} per
            interview
          </p>
        </div>
        <Button className="w-full" asChild>
          <Link to="recruiter-auth">Book interview</Link>
        </Button>
      </div>
    </div>
  );
};

export default PublishedProfile;
