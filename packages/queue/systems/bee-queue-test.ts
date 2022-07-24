import system from './bee-queue';
import { waitUntil } from '@fest/shared';

system.get('test').then(async (s) => {
  const q = await s.getQueue<{ value: number }>('test-beequeue');
  await q.add([
    {
      user: 'John',
      data: {
        value: 1
      }
    },
    {
      user: 'Doe',
      data: {
        value: 2
      }
    },
    {
      user: 'Jane',
      data: {
        value: 3
      }
    }
  ]);

  await q.add({
    user: 'Smith',
    data: {
      value: 4
    },
    retries: 3
  });

  console.log('Jobs added.');

  q.process(async (j) => {
    console.log(`Processing job from ${j.user} with value ${j.data.value}.`);

    if (j.data.value == 4) {
      console.log('Erroring job on purpose.');
      throw new Error();
    }

    await waitUntil(1000);
    console.log('Waited 1 second.');
  });
});
