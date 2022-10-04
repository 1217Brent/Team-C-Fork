import { NextPage } from 'next';
import NextError from 'next/error';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

import { useParam } from '../../../../hooks/useParam';
import { Sponsors } from '../../Events/graphql/queries';
import { Layout } from '../../shared/components/Layout';
import SponsorForm, { SponsorFormData } from '../components/SponsorForm';
import { DASHBOARD_SPONSOR } from '../graphql/queries';
import { DashboardLoading } from '../../shared/components/DashboardLoading';
import {
  useDashboardSponsorLazyQuery,
  useUpdateSponsorMutation,
} from 'generated/graphql';

const EditSponsorPage: NextPage = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { param: sponsorId, isReady } = useParam('id');
  const [getSponsor, { loading: sponsorLoading, error, data }] =
    useDashboardSponsorLazyQuery({
      variables: { sponsorId },
    });
  const [updateSponsor] = useUpdateSponsorMutation({
    refetchQueries: [
      { query: DASHBOARD_SPONSOR, variables: { id: sponsorId } },
      { query: Sponsors },
    ],
  });

  useEffect(() => {
    if (isReady) {
      getSponsor();
    }
  }, [isReady]);

  const onSubmit = async (data: SponsorFormData) => {
    setLoading(true);
    try {
      updateSponsor({
        variables: {
          data,
          updateSponsorId: sponsorId,
        },
      });
      router.replace('/dashboard/sponsors');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isLoading = sponsorLoading || !isReady || !data;
  if (isLoading || error)
    return <DashboardLoading loading={isLoading} error={error} />;
  if (!data.dashboardSponsor)
    return <NextError statusCode={404} title="Sponsor not found" />;

  return (
    <Layout>
      <SponsorForm
        loading={loading}
        onSubmit={onSubmit}
        data={data}
        submitText="Save Sponsor Changes"
        loadingText="Saving Sponsor Changes"
      />
    </Layout>
  );
};

export { EditSponsorPage };
