'use client'
import { useIsMobile } from '@/hooks/useMobile'
import Staticstics from './Staticstics'
import Layout from '@/components/layout/Layout';
import ProfileSidebar from './ProfileSidebar';

const Profile = () => {

  const isMobile = useIsMobile();

  return (
    isMobile ?
      <Layout>
        <ProfileSidebar />
      </Layout>
      :
      <Staticstics />
  )
}

export default Profile