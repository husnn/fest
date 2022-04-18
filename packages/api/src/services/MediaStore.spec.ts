import { MediaStore } from './MediaStore';

describe('Get key from URL', () => {
  const service = new MediaStore();

  test('Base path', () => {
    const actual = service.getKeyFromUrl(
      'https://fest-media-test.s3-eu-west-1.amazonaws.com/users/full/test-image.png',
      'users/full'
    );
    expect(actual).toEqual('test-image.png');
  });

  test('Without base path', () => {
    const actual = service.getKeyFromUrl(
      'https://fest-media-test.s3-eu-west-1.amazonaws.com/test-image.png'
    );
    expect(actual).toEqual('test-image.png');
  });
});
