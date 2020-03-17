const chai = require('chai');
chai.use(require('chai-as-promised'));
const dotenv = require('dotenv');
const path = require('path');

const envPath = path.resolve('../../.env');

dotenv.config({ path: envPath });

const {
  signup,
  updateCoachByCoach,
} = require('../../src/resolvers/user/mutation');

const {
  prisma: { updateUser, deleteManyUsers },
} = require('../../src/generated/prisma-client');

chai.should();

const data1 = {
  name: 'Tapo$shh',
  username: 'tappojsf',
  biography: 'lorem ipsum dollar emmet',
  facebook: 'www.facebook.com/test',
  twitter: 'www.twitter.com/twitter',
  website: 'www.golang.com/go',
  mobile: '01521206149',
};

const data2 = {
  name: 'satish',
  username: 'coach3',
};

const data3 = {
  email: 'validmail@mail.com',
};

const validData = {
  username: 'coach3',
  email: 'validmail@mail.com',
  timezone: '(GMT-11:00) Pacific/Pago_Pago',
  biography: 'mern stack developer',
  facebook: 'www.facebook.com/nai',
  twitter: 'www.twitter.com/nai',
  website: 'www.redgreenblue.com',
  mobile: '01420420420',
};

describe('Coach can update setting', function testSuit() {
  this.timeout(5000);

  let token1;
  let token2;
  let token3;

  const dummyContext1 = {
    request: { get: () => token1 },
  };

  const dummyContext2 = {
    request: { get: () => token2 },
  };

  const dummyContext3 = {
    request: { get: () => token3 },
  };

  before(async () => {
    token1 = await signup(null, {
      email: 'coach90@mail.com',
      password: 'password',
      name: 'coach one',
      username: 'coach90',
    });
    await updateUser({
      where: { email: 'coach90@mail.com' },
      data: { verified: true },
    });

    token2 = await signup(null, {
      email: 'coach91@mail.com',
      password: 'password',
      name: 'coach two',
      username: 'coach91',
    });
    await updateUser({
      where: { email: 'coach91@mail.com' },
      data: { verified: true },
    });

    token3 = await signup(null, {
      email: 'coach92@mail.com',
      password: 'password',
      name: 'coach three',
      username: 'coach92',
    });
    await updateUser({
      where: { email: 'coach92@mail.com' },
      data: { verified: true },
    });
  });

  it('name should not contain invalid character', async () => {
    const args = {};
    args.data = data1;
    await updateCoachByCoach(null, args, dummyContext1).should.be.rejectedWith(
      Error,
      /name/i
    );
  });

  it('should update the user correctly', async () => {
    const args = {};
    args.data = validData;
    await updateCoachByCoach(null, args, dummyContext3).should.be.fulfilled;
  });

  it('username should be unique', async () => {
    const args = {};
    args.data = data2;
    await updateCoachByCoach(null, args, dummyContext2).should.be.rejectedWith(
      Error,
      /username/i
    );
  });

  it('email should be unique', async () => {
    const args = {};
    args.data = data3;
    await updateCoachByCoach(null, args, dummyContext2).should.be.rejectedWith(
      Error,
      /email/i
    );
  });

  after(async () => {
    await deleteManyUsers();
  });
});
