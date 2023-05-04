const express = require("express");
const router = express.Router();
const Note = require("../models/Note");
const fetchuser = require("../middleware/fetchuser");
const { body, validationResult } = require("express-validator");

// get all the notes of the user login required Get /api/note/fetchallnotes
router.get("/fetchallnotes", fetchuser, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id });
    res.json(notes);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Some internal error occur");
  }
});

// add notes to database  the user login required Get /api/note/addnote
router.post(
  "/addnote",
  fetchuser,
  [
    body(
      "description",
      "Enter a valid description   with minimum 5 length"
    ).isLength({ min: 5 }),
    body("title", "Enter a valid title with min.3 charcters").isLength({
      min: 3,
    }),
  ],
  async (req, res) => {
    try {
      const { title, description, tag } = req.body;
      //bad validation error
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const note = new Note({
        title,
        description,
        tag,
        user: req.user.id,
      });
      const savedNote = await note.save();
      res.json(savedNote);
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Some internal error occur");
    }
  }
);

// updating note  post /api/notes/updatenote login required
router.put("/updatenote/:id", fetchuser, async (req, res) => {
  const { title, description, tag } = req.body;
  try {
    //create new note object
    const newNote = {};
    if (title) {
      newNote.title = title;
    }
    if (description) {
      newNote.description = description;
    }
    if (tag) {
      newNote.tag = tag;
    }

    //find the note which is going to update
    let note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).send("not Found");
    }
    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("not allowed");
    }

    note = await Note.findByIdAndUpdate(
      req.params.id,
      { $set: newNote },
      { new: true }
    );
    res.json({ note });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Some internal error occur");
  }
});

// delete note  delete /api/notes/deletenote login required
router.delete("/deletenote/:id", fetchuser, async (req, res) => {
  
  try {
    //find the note which is going to delete
    let note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).send("not Found");
    }
    // checking if user own this data or not
    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("not allowed");
    }

    note = await Note.findByIdAndDelete(req.params.id);
    res.json({ "successfully deleted": "note deleted" });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Some internal error occur");
  }
});

module.exports = router;
