import multer from "multer";
const MAX_FILE_SIZE = 2 * 1024 * 1024;
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cd(
        new Error(
          "Invalid file type. Only JPEG, PNG and JPG files are allowed"
        ),
        false
      );
    }
  },
});
export default upload;
