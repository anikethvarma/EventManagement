const express = require("express");
const path = require("path");
const PDFDocument = require("pdfkit");
const blobStream = require("blob-stream");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();

const dbPath = path.join(__dirname, "eventManager.db");

const initializeDBAndServer = async () => {
  try {
    db = await open({ filename: dbPath, driver: sqlite3.Database });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error:${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

app.get("/events/", async (request, response) => {
  const getEventsQuery = "SELECT * FROM event";
  const events = await db.all(getEventsQuery);
  response.send(events);
});

app.get("/sessions/:eventId", async (request, response) => {
  const { eventId } = request.params;
  const getSessionsQuery = `SELECT * FROM session where event_id = ${eventId}`;
  const sessions = await db.all(getSessionsQuery);
  response.send(sessions);
});

app.get("/participants/:eventId/", async (request, response) => {
  const { eventId } = request.params;
  const getParticipantsQuery = `SELECT t.id AS id, t.name AS name, t.age As age, t.gender As gender 
  FROM (participants INNER JOIN event_participant ON participants.id = event_participant.participant_id)
   AS t INNER JOIN event ON t.event_id = event.id WHERE event.id = ${eventId}`;

  const participants = await db.all(getParticipantsQuery);
  response.send(participants);
});

app.post("/event/", async (request, response) => {
  const { id, date, location, max_participants } = request.body;

  const createEventQuery = `INSERT INTO event VALUES (${id}, "${date}", "${location}", ${max_participants})`;
  const dbResponse = await db.run(createEventQuery);
  response.send(
    `New Event on ${date} at ${location} Added Successfully. Event Id:${dbResponse.lastId}`
  );
});

//New Session Registration
app.post("/session/:eventId", async (request, response) => {
  const { eventId } = request.params;
  const { id, speaker_name, duration_in_min, topic } = request.body;

  const createSessionQuery = `INSERT INTO session VALUES (${id}, "${speaker_name}", ${duration_in_min}, "${topic}", ${eventId})`;
  const dbResponse = await db.run(createSessionQuery);
  response.send(
    `New Session Added Successfully. Session Id:${dbResponse.lastId}`
  );
});

//Participant Registration
app.post("/participant/:eventId", async (request, response) => {
  const { eventId } = request.params;
  const { id, name, age, gender } = request.body;
  const maxParticipantsQuery = `SELECT * FROM event WHERE id=${eventId}`;
  const { max_participants } = await db.get(maxParticipantsQuery);

  const numberOfParticipantsQuery = `SELECT * FROM event_participants where event_id=${eventId}`;
  const participants = await db.all(numberOfParticipantsQuery);

  if (max_participants > participants.length) {
    const createParticipantQuery = `INSERT INTO participants VALUES (${id}, "${name}", ${age}, "${gender}")`;
    const addToEventQuery = `INSERT INTO participants VALUES (${eventId}, ${id})`;
    await db.run(createParticipantQuery);
    await db.run(addToEventQuery);
    response.send(`Registered Successfully.`);
  } else {
    response.send("Exceeding Maximum Participants");
  }
});

//PDF Generation
app.get("/pdf/:eventId", async (request, response) => {
  const { eventId } = request.params;

  const getEventDetailsQuery = `SELECT * FROM event where id=${eventId}`;
  const eventResponse = await db.get(getEventDetailsQuery);
  const { id, date, location, max_participants } = eventResponse;

  const getSessionsFromEvent = `SELECT * FROM session where event_id=${eventId}`;
  const sessionsResponse = await db.all(getSessionsFromEvent);

  const getParticipantsFromEvent = `SELECT t.id AS id, t.name AS name, t.age As age, t.gender As gender 
  FROM (participants INNER JOIN event_participant ON participants.id = event_participant.participant_id)
   AS t INNER JOIN event ON t.event_id = event.id WHERE event.id = ${eventId}`;
  const participantsResponse = await db.all(getParticipantsFromEvent);

  var doc = new PDFDocument();
  doc.fontSize(20).text(`Event - ${location}(${date}) `, 100, 80);
  doc.fontSize(16).text(`Maximum Allowed: ${max_participants}`);
  doc.moveDown();
  doc.fontSize(20).text(`Sessions - `);
  sessionsResponse.forEach((element) => {
    const { id, speaker_name, duration_in_min, topic } = element;
    doc
      .fontSize(16)
      .text(
        `Speaker: ${speaker_name} | ${topic} | Duration: ${duration_in_min}min`
      );
  });
  doc.moveDown();
  doc.fontSize(20).text(`Participants - `);
  participantsResponse.forEach((element) => {
    const { id, name, age, gender } = element;
    doc.fontSize(16).text(`Participants: ${name} | ${gender} | ${age}`);
  });

  doc.end();
  doc.pipe(response);
});

app.delete("/session/:sessionId", async (request, response) => {
  const { sessionId } = request.params;
  const deleteSessionQuery = `DELETE FROM session where id=${sessionId} `;
  await db.run(deleteSessionQuery);
  response.send("Deleted Successfully");
});
