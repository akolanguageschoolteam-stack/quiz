'use client'
import { useTranslation } from "@/hooks/useTranslation";
import ProfileSidfebar from "./ProfileSidebar";
import Layout from "@/components/layout/Layout";
import { Typography } from "@/components/storybook/atoms/Typography";
import { withAuthGuard } from "@/hoc/authguard";
import { AdZone } from "@/components/ads/AdZone";

const ProfileLayout = ({ children, title = '', desc = '', headerActions }: { children: React.ReactNode, title: string, desc: string, headerActions?: React.ReactNode }) => {

  const { t } = useTranslation();

  return (
    <Layout>
      <section className="commonPY relative">
        <div className="hidden md:block primaryContainerBg h-[20%] absolute top-0 w-full">

        </div>
        <div className="grid grid-cols-1 between-992-1199:grid-cols-1 lg:grid-cols-12 container gap-6 relative z-1">
          {/* Sidebar — visible from md (tablet) upward */}
          <div className="hidden md:flex md:flex-col md:col-span-4 max-1199:col-span-12">
            <ProfileSidfebar />
            <AdZone className="flex-1 min-h-0 mt-6" minWidth={200} minHeight={250} />
          </div>
          {/* Content */}
          <div className="md:col-span-8 max-1199:col-span-12 md:commonBg md:p-6 md:rounded-3xl md:border">
            <div className="mb-6 flex flex-wrap justify-between gap-4">
              <div className="flexCol gap-1">
                <Typography variant="h2" weight="bold">{title}</Typography>
                <Typography variant="subtitle2" weight='medium' className="onSurfaceVarColor! font-nunito!">{desc}</Typography>
              </div>
              {headerActions}
            </div>
            {children}
          </div>
        </div>

      </section>
    </Layout>

  )
}

export default withAuthGuard(ProfileLayout)