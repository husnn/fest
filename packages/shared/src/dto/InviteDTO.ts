import { InviteStatus, InviteType } from '..';

export class InviteDTO {
  status: InviteStatus;

  type: InviteType;
  code: string;

  useCount: number;
  maxUseCount: number;

  isActive: boolean;

  constructor(props: Partial<InviteDTO>) {
    this.type = props.type;
    this.code = props.code;
    this.useCount = props.useCount;
    this.maxUseCount = props.maxUseCount;
    this.isActive = props.status === InviteStatus.ACTIVE;
  }
}
