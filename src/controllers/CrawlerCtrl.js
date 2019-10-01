import cheerio from "cheerio";
import puppeteer from "puppeteer";
import { validationResult } from "express-validator";

const BASE_URL = "https://myreservations.omnibees.com";

const getData = async (checkin = null, checkout = null) => {
  try {
    const url = `${BASE_URL}/default.aspx?q=5462&version=MyReservation#/&diff=false&CheckIn=${checkin}&CheckOut=${checkout}`;

    const browser = await puppeteer.launch({
      args: ["--no-sandbox"]
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle0" });

    const content = await page.content();
    await browser.close();

    return content;
  } catch (error) {
    console.log(error);
  }
};

const formatDate = date => {
  const dateFormated = date.split("/").join("");
  return dateFormated;
};

const findRoomsByDate = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(422).json({ errors: errors.array() });

  try {
    const { checkin, checkout } = req.body;
    const $ = cheerio.load(
      await getData(formatDate(checkin), formatDate(checkout))
    );
    const rooms = [];

    $("div.roomExcerpt").each(function(i, e) {
      let x = {};

      x.name = $(this)
        .find("h5 a")
        .text()
        .trim();

      x.price = $(this)
        .find("h6.bestPriceTextColor")
        .text()
        .trim();

      x.description = $(this)
        .find("a.description")
        .text()
        .trim();

      let img = [];

      $(this)
        .find("a.fancybox-thumbs")
        .each(function(i, e) {
          img.push(
            `${BASE_URL}${$(this)
              .find("img")
              .attr("src")}`
          );
        });

      x.image = img;
      rooms.push(x);
    });
    return res.json(rooms);
  } catch (error) {
    console.log(error);
  }
};

export default findRoomsByDate;
