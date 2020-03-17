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

const coach1Mail = faker.internet.email();
const coach2Mail = faker.internet.email();
const coach3Mail = faker.internet.email();

const customerMail = faker.internet.email();

const envPath = path.resolve('../../.env');
dotenv.config({ path: envPath });
const {
  signup,
  createCustomer,
  updateCustomer,
  removeCustomer,
} = require('../../src/resolvers/user/mutation');
const {
  prisma: { deleteManyUsers, updateUser },
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
describe('Test mutate customer', function testSuit() {
  this.timeout(5000);

  let customer;
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
      email: coach1Mail,
      password: 'password',
      name: 'coach one',
      username: 'coach1',
    });

    token2 = await signup(null, {
      email: coach2Mail,
      password: 'password',
      name: 'coach two',
      username: 'coach2',
    });

    token3 = await signup(null, {
      email: coach3Mail,
      password: 'password',
      name: 'coach three',
      username: 'coach3',
    });
  });

  it('should not create client by unverified coach', async () => {
    await createCustomer(null, {}, dummyContext1).should.be.rejectedWith(
      Error,
      /permission/i
    );
    await updateUser({
      where: { email: coach1Mail },
      data: { verified: true },
    });
    await updateUser({
      where: { email: coach2Mail },
      data: { verified: true },
    });
    await updateUser({
      where: { email: coach3Mail },
      data: { verified: true },
    });
  });

  it('should not create customer without required fields', async () => {
    await createCustomer(
      null,
      { name: 'customer' },
      dummyContext1
    ).should.be.rejectedWith(Error, /email/i);
    await createCustomer(
      null,
      { email: customerMail },
      dummyContext1
    ).should.be.rejectedWith(Error, /name/i);
  });

  it('should not create customer without proper input', async () => {
    await createCustomer(
      null,
      { name: 'customer', email: 'random' },
      dummyContext1
    ).should.be.rejectedWith(Error, /email/i);

    await createCustomer(
      null,
      { name: 'cus@tomer', email: 'coach@gmail.com' },
      dummyContext1
    ).should.be.rejectedWith(Error, /name/i);
  });

  it('should create a customer', async () => {
    customer = await createCustomer(
      null,
      { email: customerMail, name: 'customer' },
      dummyContext1
    ).should.be.fulfilled;
  });

  it('should not create same customer twice', () => {
    return createCustomer(
      null,
      { email: customerMail, name: 'customer' },
      dummyContext1
    ).should.be.rejectedWith(Error, /customer/i);
  });

  it('should create a customer even if it exists for another coach', () => {
    return createCustomer(
      null,
      { email: customerMail, name: 'customer' },
      dummyContext2 // coach is changed
    ).should.be.fulfilled;
  });

  it("should not update other coach's customer", () => {
    return updateCustomer(
      null,
      { customerId: customer.id, name: 'Customer Edit' },
      dummyContext3
    ).should.be.rejectedWith(Error, /associated/i);
  });

  it('should update customer', async () => {
    await updateCustomer(
      null,
      { customerId: customer.id, name: 'Customer Edit' },
      dummyContext1
    ).should.be.fulfilled;
    await updateCustomer(
      null,
      { customerId: customer.id, name: 'Customer Edit Two' },
      dummyContext2
    ).should.be.fulfilled;
  });

  it("should not remove other coach's customer", () => {
    return removeCustomer(
      null,
      { customerId: customer.id },
      dummyContext3
    ).should.be.rejectedWith(Error, /customer/i);
  });

  it('should remove customer', async () => {
    await removeCustomer(null, { customerId: customer.id }, dummyContext1)
      .should.be.fulfilled;
    await removeCustomer(null, { customerId: customer.id }, dummyContext2)
      .should.be.fulfilled;
  });

  after(async () => {
    await deleteManyUsers();
  });
});
