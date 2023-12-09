const path = require("path");
const Notes = require("../models/notes.model");
const multer = require("multer");
const ImageKit = require("imagekit");
const fs = require("fs");

const FOLDER = "/notes-project";

const IMGKIT = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

// Path to the folder where images are stored locally using Multer
const localFolderPath = "uploads/";

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
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
}).array("images", 8); // Accept up to 8 images, 'images' should match the input field name

const addNotes = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.log(err);
      res.status(400).send({ message: err.message });
    } else {
      try {
        const files = fs.readdirSync(localFolderPath);

        // Array to store promises of file uploads
        const uploadPromises = [];

        // Loop through each file and create a promise for each upload
        files.forEach((file) => {
          const localFilePath = localFolderPath + file;
          const uploadOptions = {
            file: fs.createReadStream(localFilePath),
            fileName: file,
            folder: FOLDER, // Change this to the desired folder in your ImageKit media library
          };

          // Push the upload promise to the array
          uploadPromises.push(
            new Promise((resolve, reject) => {
              IMGKIT.upload(uploadOptions, (err, result) => {
                if (err) {
                  console.error("Error uploading file to ImageKit:", err);
                  reject(err); // Reject the promise if there's an error
                } else {
                  console.log("File uploaded successfully:", result);
                  // Optionally, you can remove the local file after successful upload
                  fs.unlink(localFilePath, (unlinkErr) => {
                    if (unlinkErr) {
                      console.error("Error deleting local file:", unlinkErr);
                    } else {
                      console.log("Local file deleted successfully");
                    }
                  });
                  resolve(result); // Resolve the promise if successful
                }
              });
            })
          );
        });

        // Wait for all ImageKit upload promises to resolve
        const imageKitUploads = await Promise.all(uploadPromises);

        // Extract ImageKit URLs from the upload results
        const fileUrls = imageKitUploads.map((result) => ({
          image: result.url, // Assuming 'url' holds the ImageKit URL
        }));

        console.log(fileUrls, "fileUrls");
        const { userId } = req.user;
        const { message, title } = req.body;
        const { type, noteId } = req.query;
        console.log(type, noteId);

        const bodyData = {
          title,
          message,
          images: fileUrls,
        };

        console.log("bodyData", bodyData);
        // step 1 finding note

        let userNotes = await Notes.findOne({ userId });

        if (type === "edit" && noteId) {
          console.log("<<<<<<<<<<<<<<<<<<<<<< inside edit");
          // finding note based on note id
          const noteExist = userNotes?.notes?.find(
            (note) => note._id == noteId
          );

          console.log(noteExist, "noteExist");
          if (noteExist) {
            const updatedNoteList = userNotes?.notes?.map((note) => {
              if (note._id == noteId) {
                return bodyData;
              }
              return note;
            });

            console.log(updatedNoteList, "updatedNoteList");
            if (updatedNoteList) {
              const updaedNotes = await Notes.updateOne(
                { userId },
                { $set: { notes: updatedNoteList } },
                {
                  new: true,
                }
              );

              if (updaedNotes) {
                res.status(200).send({
                  success: true,
                  message: "Note updated successfully",
                  updaedNotes: updaedNotes,
                });
              }
            }
          } else {
            res.status(200).send({
              success: true,
              message: "Note does'nt exist",
            });
          }
        } else {
          // step 2 checking note exist or not

          if (!userNotes) {
            // new note
            userNotes = new Notes({ userId, notes: [] });

            userNotes.notes.push(bodyData);
            const noteCreated = await userNotes.save();
            console.log(noteCreated);
            res.status(201).send({
              success: true,
              message: "Note added successfully",
              note: noteCreated,
            });
          } else {
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
              console.log(noteCreated);
              res.status(201).send({
                success: true,
                message: "Note added successfully",
                note: noteCreated,
              });
            }
          }
        }
      } catch (error) {
        console.error("Error reading folder or uploading files:", error);
        res.status(500).send({
          success: false,
          message: "Error uploading images",
        });
      }
    }
  });
};

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

const deleteNoteImg = async (req, res) => {
  try {
    const { userId } = req.user;
    const { noteId, imgId } = req.body;

    // Find the user's notes
    let userNotes = await Notes.findOne({ userId });

    if (userNotes) {
      // Find the specific note by ID
      const note = userNotes.notes.find((note) => note._id == noteId);

      if (note) {
        // Filter out the image with the given imgId from the note's images array
        note.images = note.images.filter((image) => image._id != imgId);

        // Save the changes to the database
        const updatedUserNotes = await userNotes.save();

        if (updatedUserNotes) {
          return res.status(200).send({
            success: true,
            message: "Note image deleted successfully",
          });
        }
      } else {
        return res.status(404).send({
          success: false,
          message: "Note not found",
        });
      }
    } else {
      return res.status(404).send({
        success: false,
        message: "User notes not found",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: error.message });
  }
};

module.exports = {
  addNotes,
  getUserNotes,
  deleteNotes,
  editNotes,
  deleteNoteImg,
};
