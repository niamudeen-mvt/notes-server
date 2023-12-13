const Notes = require("../models/notes.model");
const ImageKit = require("imagekit");
const User = require("../models/user.model");

const FOLDER = "/notes-project";

const IMGKIT = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

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

const uploadToImageKit = async (folderName, base64File, fileName) => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      file: base64File,
      fileName: fileName,
      folder: "/notes-project/" + folderName,
    };

    IMGKIT.upload(uploadOptions, (err, result) => {
      if (err) {
        console.error("Error uploading file to ImageKit:", err);
        reject(err);
      } else {
        console.log("File uploaded successfully:", result);
        resolve(result);
      }
    });
  });
};

const addNotes = async (req, res) => {
  try {
    const { title, message, images } = req.body;
    const { userId } = req.user;
    let fileUrls = [];

    if (images.length !== 0) {
      const uploadPromises = images.map(async (file) => {
        return await uploadToImageKit(userId, file.data, file.key);
      });

      const results = await Promise.all(uploadPromises);
      fileUrls = results.map((result) => ({
        image: result.url,
        fileId: result.fileId, // Assuming 'url' holds the ImageKit URL
      }));
    } else {
      fileUrls = [];
    }

    const bodyData = {
      title,
      message,
      images: fileUrls,
    };

    let userNotes = await Notes.findOne({ userId });

    if (!userNotes) {
      userNotes = new Notes({ userId, notes: [] });
    }

    const noteExist = userNotes?.notes?.find(
      (note) => note.message === message
    );

    if (noteExist) {
      res.status(409).send({
        success: true,
        message: "Note already exist",
      });
    } else {
      userNotes.notes.push(bodyData);
      await userNotes.save();

      return res.status(201).send({
        success: true,
        message: "Note added successfully",
      });
    }
  } catch (error) {
    console.error("Error reading folder or uploading files:", error);
    res.status(500).send({
      success: false,
      message: "Error uploading images",
    });
  }
};

const editNotes = async (req, res) => {
  try {
    const { title, message, prev_imgages, new_images } = req.body;
    const { userId } = req.user;
    const noteId = req.params.id;

    let userNotes = await Notes.findOne({ userId });

    const noteIndex = userNotes.notes.findIndex((note) => note._id == noteId);

    if (noteIndex !== -1) {
      const updatedNote = { ...userNotes.notes[noteIndex] };

      if (title !== undefined) {
        updatedNote.title = title;
      }

      if (message !== undefined) {
        updatedNote.message = message;
      }

      if (Array.isArray(new_images) && new_images.length > 0) {
        console.log("new images added");
        const uploadPromises = new_images.map(async (file) => {
          const result = await uploadToImageKit(userId, file.data, file.key);
          return { image: result.url, fileId: result.fileId }; // Assuming 'url' holds the ImageKit URL
        });

        const fileUrls = await Promise.all(uploadPromises);

        const imageList = [...prev_imgages, ...fileUrls];

        updatedNote.images = imageList;
      } else {
        updatedNote.images = prev_imgages;
      }

      userNotes.notes[noteIndex] = updatedNote;
      await userNotes.save();

      return res.status(200).send({
        success: true,
        message: "Note updated successfully",
      });
    }
    return res.status(200).send({
      success: true,
      message: "Note doesn't exist",
    });
  } catch (error) {
    console.error("Error reading folder or uploading files:", error);
    res.status(500).send({
      success: false,
      message: "Error updating note",
    });
  }
};

module.exports = {
  addNotes,
  getUserNotes,
  deleteNotes,
  editNotes,
  deleteNoteImg,
};
