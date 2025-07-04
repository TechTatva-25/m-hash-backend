import { Schema, model, Document } from "mongoose";

export interface IBugType extends Document {
  name: string;
  default_points: number;
}

const BugTypeSchema = new Schema<IBugType>({
  name: { type: String, required: true, unique: true },
  default_points: { type: Number, required: true },
});

export default model<IBugType>("BugType", BugTypeSchema);
