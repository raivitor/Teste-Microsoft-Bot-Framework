import { Router } from "express";
import CrawlerCtrl from "./controllers/CrawlerCtrl.js";
const { check } = require("express-validator");

const routes = new Router();

const validator = [
  check("checkin")
    .not()
    .isEmpty()
    .withMessage("Cannot be empty")
    .matches(/^\d{2}\/\d{2}\/\d{4}$/)
    .withMessage("must have a date in the format DD/MM/YYYY")
    .custom(value => {
      const checkinDate = new Date(
        value.split("/")[2],
        value.split("/")[1] - 1,
        value.split("/")[0]
      );

      //@TODO - fix timezone
      if (checkinDate < new Date()) {
        throw new Error("Check in date cannot be in the past");
      }
      return true;
    }),
  check("checkout")
    .not()
    .isEmpty()
    .withMessage("Cannot be empty")
    .matches(/^\d{2}\/\d{2}\/\d{4}$/)
    .withMessage("must have a date in the format DD/MM/YYYY")
    .custom((value, { req }) => {
      const { checkin, checkout } = req.body;
      const checkinDate = new Date(
        checkin.split("/")[2],
        checkin.split("/")[1] - 1,
        checkin.split("/")[0]
      );
      const checkoutDate = new Date(
        checkout.split("/")[2],
        checkout.split("/")[1] - 1,
        checkout.split("/")[0]
      );

      if (checkinDate >= checkoutDate) {
        throw new Error("Check-out must be greater than check-in");
      }
      return true;
    })
];

routes.post("/buscar", validator, CrawlerCtrl);

export default routes;
