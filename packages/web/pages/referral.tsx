import { InviteDTO, InviteType } from '@fanbase/shared';
import React, { useEffect, useState } from 'react';

import { ApiClient } from '../modules/api';
import Head from 'next/head';
import styled from '@emotion/styled';

const Container = styled.div`
  margin: 0 auto;
  max-width: 500px;

  > * + * {
    margin-top: 30px;
  }
`;

const CodeCollection = styled.div`
  gap: 20px;
`;

const CodeCard = styled.div`
  padding: 30px 20px;
  background-color: #f5f5f5;
  border-radius: 20px;

  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  img {
    width: 30px;
    height: 30px;
    opacity: 0.3;
    cursor: pointer;
  }

  img:hover {
    opacity: 0.5;
  }
`;

const CodeInfo = styled.div`
  > * + * {
    margin-top: 5px;
  }
`;

export const ReferralPage = () => {
  const [invites, setInvites] = useState<InviteDTO[]>([]);

  const [copied, setCopied] = useState<InviteDTO>();

  const copyCode = (invite: InviteDTO) => {
    navigator.clipboard.writeText(invite.code);
    setCopied(invite);
  };

  const InviteCode = ({ invite }: { invite: InviteDTO }) => {
    return (
      <CodeCard>
        <CodeInfo>
          <h3>{invite.code}</h3>
          <p className="smaller">
            {invite.useCount}/{invite.maxUseCount}
          </p>
        </CodeInfo>
        {copied != invite ? (
          <img
            src="images/ic-copy.png"
            onClick={() => {
              copyCode(invite);
            }}
          />
        ) : (
          <p className="small">Copied!</p>
        )}
      </CodeCard>
    );
  };

  useEffect(() => {
    ApiClient.getInstance()
      .getReferralSummary()
      .then((response) => {
        setInvites(response.invites);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const Box = ({
    title,
    types = [InviteType.BASIC]
  }: {
    title: string;
    types?: InviteType[];
  }) => {
    const invitesToShow = invites.filter((invite) =>
      types.includes(invite.type)
    );

    return invitesToShow.length > 0 ? (
      <div>
        <h2 style={{ marginBottom: 10 }}>{title}</h2>
        <CodeCollection className="two-col">
          {invitesToShow.map((invite) => (
            <InviteCode key={invite.code} invite={invite} />
          ))}
        </CodeCollection>
      </div>
    ) : null;
  };

  return (
    <div className="container boxed">
      <Head>
        <title>Referral</title>
      </Head>
      <Container>
        <Box
          title="Share these with your friends!"
          types={[InviteType.BASIC, InviteType.CREATOR]}
        />
        <Box title="Share these with your fans!" types={[InviteType.FAN]} />
      </Container>
    </div>
  );
};

export default ReferralPage;
