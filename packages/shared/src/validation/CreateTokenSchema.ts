import * as Yup from 'yup';

import { TokenType } from '../enums';

export const CreateTokenSchema = Yup.object().shape({
  type: Yup.mixed<TokenType>().oneOf(Object.values(TokenType)).required(),
  resource: Yup.mixed().when('type', {
    is: TokenType.YT_VIDEO,
    otherwise: Yup.mixed().nullable()
  }),
  name: Yup.string().label('Name').max(100).required(),
  description: Yup.string().label('Description').min(3).max(500),
  media: Yup.string().url(),
  supply: Yup.number().label('Supply').min(1).max(999999).required(),
  royaltyPercentage: Yup.number()
    .label('Royalty percentage')
    .min(0)
    .max(100)
    .required(),
  attributes: Yup.object()
});

export default CreateTokenSchema;
