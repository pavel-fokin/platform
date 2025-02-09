import { redirect, useLoaderData, type LoaderFunctionArgs } from 'react-router';

import * as profileService from '~/services/profile.server';

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
    <div className="grow flex flex-col space-y-10">
      <h2 className="font-semibold">Published Profile</h2>
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col space-y-2">
          <h3 className="font-semibold">Name</h3>
          <p>{profile.name}</p>
        </div>
      </div>
    </div>
  );
};

export default PublishedProfile;
