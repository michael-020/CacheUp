import multer from 'multer';
import path from 'path';
import express, { Request } from 'express';

const app = express();
app.use(express.urlencoded({ extended: false })); 
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); 

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  destination: string;
  filename: string;
  path: string;
  size: number;
}

const storage = multer.diskStorage({
  destination: function (req: Request, file: MulterFile, cb: (error: Error | null, destination: string) => void) {
      if (req.route?.path === "/createPost") {
          cb(null, './uploads/userPostsImages');
      } else {
          cb(null, './uploads/profileImages');
      }
  },
  filename: function (req: Request, file: MulterFile, cb: (error: Error | null, filename: string) => void) {
      cb(null, `${Date.now()}-${file.originalname}`); 
  }
});
  
const upload = multer({ storage: storage });

export { upload };