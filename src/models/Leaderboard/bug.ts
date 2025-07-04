import { Schema, model, Document, Types } from "mongoose";

export type BugStatus = "valid" | "invalid" | "pending";

export interface IBug extends Document {
  category: string; // BugType name or ObjectId
  reported_by_team_id: Types.ObjectId;
  found_in_team_id: Types.ObjectId;
  status: BugStatus;
  points_awarded: number;
  admin_notes?: string;
  created_at: Date;
  updated_at: Date;
}

const BugSchema = new Schema<IBug>({
  category: { type: String, required: true }, // or use ObjectId and ref: "BugType"
  reported_by_team_id: { type: Schema.Types.ObjectId, ref: "Team", required: true },
  found_in_team_id: { type: Schema.Types.ObjectId, ref: "Team", required: true },
  status: { type: String, enum: ["valid", "invalid", "pending"], default: "pending" },
  points_awarded: { type: Number, required: true },
  admin_notes: { type: String },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

export default model<IBug>("Bug", BugSchema);
