/**
 * Parvez M Robin
 * this@parvezmrobin.com
 * Date: Jan 09, 2020
 */
/* eslint-disable no-console */

const chai = require('chai');
const axios = require('axios');

chai.should();

process.env.IS_TEST = true;

const sessionTypeId = '5e123942da6ad5000d800972'; // coach1 session type 1
const customerId = '5e123a33da6ad5000d80097b'; // parvezmrobin@gmail.com
const url = 'http://localhost:4000';
const sessionIds = [];
let start;
let token;

describe('Test available time speed', () => {
  start = new Date();
  start.setHours(0);
  start.setMinutes(0);
  start.setSeconds(0);
  start.setMilliseconds(0);
  start.setDate(start.getDate() + 16);

  const tomorrow = new Date();
  tomorrow.setHours(0);
  tomorrow.setMinutes(0);
  tomorrow.setSeconds(0);
  tomorrow.setMilliseconds(0);
  tomorrow.setDate(start.getDate() + 1);

  before(async () => {
    const email = 'coach1@mail.com';
    const password = 'coach1';
    const query = `mutation {
      signin(
        email: "${email}"
        password: "${password}"
      ) {
        token
        user {
          id
          name
          businessHour {
            start
            end
          }
        }
      }
    }`;

    const response = await axios.post(url, { query });

    response.status.should.be.equals(200);
    try {
      ({ token } = response.data.data.signin);
    } catch {
      console.log('response.data', response.data);
    }
    console.log('token', token);
    axios.defaults.headers.common.Authorization = token;

    const errors = [];
    for (; start < tomorrow; start.setMinutes(start.getMinutes() + 5)) {
      const end = new Date(start.getTime());
      end.setMinutes(end.getMinutes() + 4);
      const sessionQuery = `mutation {
        createSession(
          sessionTypeId: "${sessionTypeId}"
          data: {
            name: "5 minutes session"
            description: "5 minutes session description"
            location: "stadium"
            link: "https://www.coachsnap.com/123123qehasd/event/football"
            availability: { 
              create: { 
                start: "${start.toISOString()}"
                end: "${end.toISOString()}" 
              }
            }
            recurring: false
            maxSeats: 20
            cost: 20
          }
        ) {
          id
        }
      }`;

      let sessionResponse;
      try {
        sessionResponse = await axios.post(url, { query: sessionQuery });
        sessionIds.push(sessionResponse.data.data.createSession.id);
      } catch (e) {
        if (sessionResponse) {
          errors.push(sessionResponse.data);
        } else {
          errors.push(e.response.data);
        }
      }
    }

    console.log('sessionIds.length', sessionIds.length);
    if (errors.length) {
      console.log('errors.length', errors.length);
      console.log('errors', errors.slice(0, 6));
    }

    const promises = [];
    for (const sessionId of sessionIds) {
      const bookingQuery = `mutation {
        createBooking(
          sessionId: "${sessionId}"
          customerId: "${customerId}"
        ) {
          id
          customer {
            name
          }
          session {
            id
            name
            description
          }
        }
      }`;
      const promise = axios.post(url, { query: bookingQuery });

      promises.push(promise);
    }

    const bookingResponses = await Promise.all(promises);
  });

  it('should check the time to generate available time with 100 sessions', async () => {
    start.setDate(start.getDate() - 1);
    const query = `{
     availableTimes(
        start: "00:00",
        end: "23:59",
        date: "${start.toISOString()}"
        blockSize: 5
        roundBy: 0
      )
    }`;
    const response = await axios.post(url, { query });
  }).timeout(60000);
});
