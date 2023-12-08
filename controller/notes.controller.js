const Notes = require("../models/notes.model");



const multer = require("multer");
const path = require("path");

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Destination folder for uploaded files
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    ); // File naming: fieldname-timestamp.ext
  },
});

// Multer Upload Configuration
const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // Limit file size to 5MB (adjust as needed)
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only images are allowed."));
    }
  },
}).array("images", 5); // Accept up to 5 images, 'images' should match the input field name


const addNotes = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.log(err);
      res.status(400).json({ message: err.message });
    } else {
      let fileUrls;
      if (!req.files || req.files.length === 0) {
        fileUrls = []
      } else {
        fileUrls = req.files.map((file) => ({
          image: `uploads/${file.filename}`,
        }));
      }

      try {
        console.log(req.body, req.files)
        const { userId } = req.user;
        const { message } = req.body;

        const bodyData = {
          message: req.body.message,
          images: fileUrls
        }
        console.log(bodyData)

        // step 1 finding note 

        let userNotes = await Notes.findOne({ userId });

        // step 2 checking note exist or not

        if (!userNotes) {
          // new note
          userNotes = new Notes({ userId, notes: [] });

          userNotes.notes.push(bodyData);
          const noteCreated = await userNotes.save();
          console.log(noteCreated)
          res.status(201).send({
            success: true,
            message: "Note added successfully",
            note: noteCreated,
          });
        }
        else {
          const noteExist = userNotes?.notes?.find(
            (note) => note.message === message
          );

          if (noteExist) {
            res.status(400).send({
              success: true,
              message: "Note already exist",
            });
          } else {
            userNotes.notes.push(bodyData);
            const noteCreated = await userNotes.save();
            console.log(noteCreated)
            res.status(201).send({
              success: true,
              message: "Note added successfully",
              note: noteCreated,
            });
          }
        }
      } catch (error) {
        console.log(error);
        res.status(500).send({ message: error });
      }
    }
  });
};






// const addNotes = async (req, res) => {
//   try {
//     const { message } = req.body;
//     const { userId } = req.user;

//     let userNotes = await Notes.findOne({ userId });

//     if (!userNotes) {
//       // new note
//       userNotes = new Notes({ userId, notes: [] });

//       userNotes.notes.push({ message });
//       const noteCreated = await userNotes.save();
//       res.status(201).send({
//         success: true,
//         message: "Note added successfully",
//         note: noteCreated,
//       });
//     } else {
//       const noteExist = userNotes?.notes?.find(
//         (note) => note.message === message
//       );

//       if (noteExist) {
//         res.status(400).send({
//           success: true,
//           message: "Note already exist",
//         });
//       } else {
//         userNotes.notes.push({ message });
//         const noteCreated = await userNotes.save();
//         res.status(201).send({
//           success: true,
//           message: "Note added successfully",
//           note: noteCreated,
//         });
//       }
//     }
//   } catch (error) {
//     console.log(error);
//     res.status(500).send({ message: error });
//   }
// };

const getUserNotes = async (req, res) => {
  try {
    const { userId } = req.user;

    let userNotes = await Notes.findOne({ userId });
    if (userNotes) {
      res.status(200).send({
        success: true,
        message: "Notes found successfully",
        user: userNotes,
      });
    } else {
      res.status(200).send({
        success: true,
        message: "Noes Not found",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: error });
  }
};

const editNotes = async (req, res) => {
  try {
    const { message } = req.body;
    const { userId } = req.user;
    const noteId = req.params.id;

    // find note by id
    let userNotes = await Notes.findOne({ userId });

    // finding note based on note id
    const noteExist = userNotes?.notes?.find((note) => note._id == noteId);
    if (noteExist) {
      const updatedNoteList = userNotes?.notes?.map((note) => {
        if (note._id == noteId) {
          note.message = message;
        }
        return note;
      });

      console.log(updatedNoteList);
      if (updatedNoteList) {
        const updaedNotes = await Notes.updateOne(
          { userId },
          { $set: { notes: updatedNoteList } }
        );

        if (updaedNotes) {
          res.status(200).send({
            success: true,
            message: "Note updated successfully",
          });
        }
      }
    } else {
      res.status(200).send({
        success: true,
        message: "Note does'nt exist",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: error });
  }
};

const deleteNotes = async (req, res) => {
  try {
    const { userId } = req.user;
    const noteId = req.params.id;

    let userNotes = await Notes.findOne({ userId });

    const noteExist = userNotes?.notes?.find((note) => note._id == noteId);

    console.log(noteExist, "noteExist");
    if (noteExist) {
      const filterNotes = userNotes?.notes?.filter(
        (note) => note._id != noteId
      );

      if (filterNotes) {
        const updaedNotes = await Notes.updateOne(
          { userId },
          { $set: { notes: filterNotes } },
          { new: true }
        );

        if (updaedNotes) {
          res.status(200).send({
            success: true,
            message: "Note deleted successfully",
          });
        }
      }
    } else {
      res.status(200).send({
        success: true,
        message: "Note does'nt exist",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: error });
  }
};

module.exports = { addNotes, getUserNotes, deleteNotes, editNotes };
