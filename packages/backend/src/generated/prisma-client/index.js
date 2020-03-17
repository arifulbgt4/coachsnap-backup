"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var prisma_lib_1 = require("prisma-client-lib");
var typeDefs = require("./prisma-schema").typeDefs;

var models = [
  {
    name: "Image",
    embedded: false
  },
  {
    name: "StripeAccount",
    embedded: false
  },
  {
    name: "User",
    embedded: false
  },
  {
    name: "LastLogin",
    embedded: false
  },
  {
    name: "Role",
    embedded: false
  },
  {
    name: "Customer",
    embedded: false
  },
  {
    name: "Activity",
    embedded: false
  },
  {
    name: "Content",
    embedded: false
  },
  {
    name: "Session",
    embedded: false
  },
  {
    name: "Availability",
    embedded: false
  },
  {
    name: "BusinessHour",
    embedded: false
  },
  {
    name: "Booking",
    embedded: false
  },
  {
    name: "SessionType",
    embedded: false
  },
  {
    name: "Charge",
    embedded: false
  }
];
exports.Prisma = prisma_lib_1.makePrismaClientClass({
  typeDefs,
  models,
  endpoint: `${process.env["PRISMA_ENDPOINT"]}`,
  secret: `${process.env["PRISMA_SECRET"]}`
});
exports.prisma = new exports.Prisma();
