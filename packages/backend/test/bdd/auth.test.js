/**
 * Parvez M Robin
 * this@parvezmrobin.com
 * Date: Jan 24, 2020
 */

const chai = require('chai');
chai.use(require('chai-as-promised'));
const dotenv = require('dotenv');
const path = require('path');
const faker = require('faker');

const mail = faker.internet.email();

const envPath = path.resolve('../../.env');
dotenv.config({ path: envPath });
const { signup, signin } = require('../../src/resolvers/user/mutation');

const {
  prisma: { deleteManyUsers },
} = require('../../src/generated/prisma-client');

chai.should();

describe('Test authentication', () => {
  /**
   * **Coach - can sign up using email and password**
   *
   * The email format must be valid
   * The email should be unique
   * The password must be not less than 6 characters
   */
  const baseSignUpArgs = {
    password: 'password',
    email: mail,
    name: 'name',
    username: 'username',
  };

  describe('Coach can sign up using email and password', () => {
    it('should not create account with invalid email', () => {
      const args = { ...baseSignUpArgs, email: 'email' };
      return signup(null, args).should.be.rejectedWith(Error, /email/i);
    });

    it('should not create account with short password', () => {
      const args = { ...baseSignUpArgs, password: 'pass' };
      return signup(null, args).should.be.rejectedWith(Error, /password/i);
    });

    it('should not create account with invalid name', () => {
      const args = { ...baseSignUpArgs, name: 'name1' };
      return signup(null, args).should.be.rejectedWith(Error, /name/i);
    });

    it('should not create account without username', () => {
      const args = { ...baseSignUpArgs, username: null };
      return signup(null, args).should.be.rejectedWith(Error, /username/i);
    });

    it('should create a new user', async () => {
      // some users may be created because of previously failed test cases
      // ensure that those failed cases do not fail this case too
      await deleteManyUsers();

      const args = { ...baseSignUpArgs };
      return signup(null, args).should.eventually.be.an('string');
    }).timeout(5000); // giving some time to send mail and other time consuming stuffs

    it('should not create a new user with duplicate email', () => {
      const args = { ...baseSignUpArgs };
      return signup(null, args).should.be.rejectedWith(
        Error,
        /user.*email|email.*user/i // error message should contain both the words user and email
      );
    });
  });

  /**
   * **Coach - can login using email and password**
   *
   * should be able to login using proper email and password
   * should not be able to login using wrong email and/or password
   */
  const baseLogInArgs = {
    password: 'password',
    email: mail,
  };
  describe('Coach can sign in using email and password', () => {
    it('should not sign in with invalid email', () => {
      const args = { ...baseLogInArgs, email: 'em@ail1@mail.com' };
      return signin(null, args).should.be.rejectedWith(Error, /email|user/i);
    });

    it('should not sign in with invalid password', async () => {
      const args = { ...baseLogInArgs, password: 'pass' };
      return signin(null, args).should.be.rejectedWith(Error, /password/i);
    });

    it('should sign in', () => {
      const args = { ...baseLogInArgs };
      return signin(null, args).should.be.fulfilled;
    });
  });

  after(async () => {
    await deleteManyUsers();
  });
});
