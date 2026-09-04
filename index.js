var express = require("express");
var app = express();

var cors = require("cors");
app.use(cors({ optionsSuccessStatus: 200 }));

// Serve CSS and JavaScript from public/
app.use(express.static(__dirname + "/public"));

// Event Timestamp Tracker page
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/views/index.html");
});

// Timestamp API
app.get("/api/:date?", function (req, res) {
  let date;

  if (!req.params.date) {
    date = new Date();
  } else if (/^\d+$/.test(req.params.date)) {
    // If the input is a Unix timestamp in milliseconds
    date = new Date(Number(req.params.date));
  } else {
    // Otherwise, parse it as a normal date string
    date = new Date(req.params.date);
  }

  if (isNaN(date.getTime())) {
    return res.json({
      error: "Invalid Date"
    });
  }

  res.json({
    unix: date.getTime(),
    utc: date.toUTCString()
  });
});

// Start server
var listener = app.listen(process.env.PORT || 3000, function () {
  console.log(
    "Event Timestamp Tracker is running on port " +
    listener.address().port
  );
});
