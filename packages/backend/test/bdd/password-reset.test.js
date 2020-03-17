/**
 * Parvez M Robin
 * this@parvezmrobin.com
 * Date: Jan 25, 2020
 */

const chai = require('chai');
chai.use(require('chai-as-promised'));
const dotenv = require('dotenv');
const path = require('path');

const faker = require('faker');

const email = faker.internet.email();

const envPath = path.resolve('../../.env');
dotenv.config({ path: envPath });
const {
  signup,
  requestReset,
  resetPassword,
} = require('../../src/resolvers/user/mutation');
const {
  prisma: { deleteManyUsers, user },
} = require('../../src/generated/prisma-client');

chai.should();

/**
 * **Coach - can reset password**
 *
 * **Should fail** if there is no user with given email id
 * **Should fail** if the given email id is of admin
 * **Should** send a verification email to proper email
 * **Should** be able to update password by providing the proper token
 */
describe('Test password reset', () => {
  before(() => {
    const args = {
      email,
      password: 'password',
      name: 'name',
      username: 'username',
    };

    return signup(null, args);
  });

  describe('Test sending token', () => {
    it('should not send reset email with invalid email', () => {
      const args = { email: 'email1@mail.com' };
      return requestReset(null, args).should.be.rejectedWith(/user|email/i);
    });

    it('should send reset email', () => {
      const args = { email };
      return requestReset(null, args)
        .should.eventually.have.property('message')
        .that.matches(/(?=.*email)(?=.*reset)(?=.*url)/i); // contains the words email, reset and url in any order
    });
  });

  describe('Test resetting password', () => {
    let token;

    before(async () => {
      const { resetToken } = await user({ email });
      token = resetToken;
    });

    it('should not reset password without the verification token', () => {
      const args = {
        resetToken: 'abcd',
        password: 'password1',
        confirmPassword: 'password1',
      };

      return resetPassword(null, args, null).should.be.rejectedWith(
        Error,
        /token/i
      );
    });

    it('should not reset password with mismatched passwords', () => {
      const args = {
        resetToken: token,
        password: 'password1',
        confirmPassword: 'password',
      };

      return resetPassword(null, args, null).should.be.rejectedWith(
        Error,
        /password/i
      );
    });

    it('should not reset password with short passwords', () => {
      const args = {
        resetToken: token,
        password: 'pass',
        confirmPassword: 'pass',
      };

      return resetPassword(null, args, null).should.be.rejectedWith(
        Error,
        /(?=.*password)(?=.*character)/i
      );
    });

    it('should reset password', () => {
      const args = {
        resetToken: token,
        password: 'password1',
        confirmPassword: 'password1',
      };

      return resetPassword(null, args, null)
        .should.eventually.have.property('message')
        .that.matches(/(?=.*password)(?=.*change)/i);
    });
  });

  after(async () => {
    await deleteManyUsers();
  });
});
