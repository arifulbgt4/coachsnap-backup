/**
 * Parvez M Robin
 * this@parvezmrobin.com
 * Date: Jan 26, 2020
 */

const chai = require('chai');
chai.use(require('chai-as-promised'));
const dotenv = require('dotenv');
const path = require('path');
const faker = require('faker');

const coachEmail = faker.internet.email();

const envPath = path.resolve('../../.env');
dotenv.config({ path: envPath });
const { signup } = require('../../src/resolvers/user/mutation');
const {
  createCoach,
  updateCoach,
  deleteCoach,
  resetCoachAccount,
} = require('../../src/resolvers/admin/mutation');
const {
  prisma: { deleteManyUsers, updateUser, user },
} = require('../../src/generated/prisma-client');

chai.should();

/**
 * **Coach - can mutate customer**
 *
 * **Should not** be able to create client if coach is not verified
 * **Should not** be able to create client without required fields
 * **Should not** be able to create a client with existing email (for that particular coach)
 * **Should** be able to create client if this email is existing for someone else coach's client
 * **Should not** be able to edit other coaches' clients
 * **Should not** be able to delete other coaches' clients
 * **Should** be able to edit client
 * **Should** be able to delete client
 */
describe('Test admin functionality', function testSuit() {
  this.timeout(5000);

  let token;
  const dummyContext = {
    request: { get: () => token },
  };
  let coach;

  before(async () => {
    token = await signup(null, {
      email: 'admin@mail.com',
      password: 'password',
      name: 'admin',
      username: 'admin',
    });

    await updateUser({
      where: { email: 'admin@mail.com' },
      data: {
        verified: true,
        role: 'ADMIN',
      },
    });
  });

  it('should invite a coach', async () => {
    await createCoach(
      null,
      {
        email: coachEmail,
        name: 'coach',
      },
      dummyContext
    ).should.be.fulfilled;
  });

  it('should not verify coach without proper invite token', async () => {
    await resetCoachAccount(null, {
      inviteToken: 'abcd',
      email: coachEmail,
      username: 'coach',
      password: 'password',
    }).should.be.rejectedWith(Error, /(?=.*invalid)(?=.*token)/i);
  });

  it('should verify coach', async () => {
    const { inviteToken } = await user({ email: coachEmail });
    await resetCoachAccount(null, {
      inviteToken,
      email: coachEmail,
      username: 'coach',
      password: 'password',
    }).should.be.fulfilled;
  });

  it('should not invite already existing coach', async () => {
    await createCoach(
      null,
      {
        email: coachEmail,
        name: 'coach',
      },
      dummyContext
    ).should.be.rejectedWith(Error, /email/i);
  });

  it('should not invite a customer as a coach', async () => {
    await signup(null, {
      email: 'customer@mail.com',
      password: 'password',
      name: 'customer',
      username: 'customer',
    });

    await updateUser({
      where: { email: 'customer@mail.com' },
      data: {
        verified: true,
        role: 'CUSTOMER',
      },
    });

    await createCoach(
      null,
      {
        email: 'customer@mail.com',
        name: 'coach',
      },
      dummyContext
    ).should.be.rejectedWith(Error, /email/i);
  });

  it('should not invite an admin as a coach', async () => {
    await signup(null, {
      email: 'admin2@mail.com',
      password: 'password',
      name: 'admin two',
      username: 'admin2',
    });

    await updateUser({
      where: { email: 'admin2@mail.com' },
      data: {
        verified: true,
        role: 'ADMIN',
      },
    });

    await createCoach(
      null,
      {
        email: 'admin2@mail.com',
        name: 'coach',
      },
      dummyContext
    ).should.be.rejectedWith(Error, /email/i);
  });

  it("should not edit coach's mail that is of another coach", async () => {
    coach = await user({ email: coachEmail });

    await signup(null, {
      email: 'coach420@mail.com',
      password: 'password',
      name: 'coach two',
      username: 'coach420',
    });

    await updateCoach(
      null,
      {
        data: { email: 'coach420@mail.com' },
        coachId: coach.id,
      },
      dummyContext
    ).should.be.rejectedWith(Error, /email/);
  });

  it("should edit coach's mail", async () => {
    await updateCoach(
      null,
      {
        data: { email: 'coach1@mail.com' },
        coachId: coach.id,
      },
      dummyContext
    ).should.be.fulfilled;
  });

  it('should delete coach', () => {
    return deleteCoach(null, { id: coach.id }, dummyContext).should.be
      .fulfilled;
  });

  after(async () => {
    await deleteManyUsers();
  });
});
