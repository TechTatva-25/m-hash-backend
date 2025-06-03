import mongoose, { Document, Schema } from "mongoose";

export interface IRuntimeConfig extends Document {
  key: string;
  value: boolean;
}

const RuntimeConfigSchema: Schema<IRuntimeConfig> = new Schema<IRuntimeConfig>({
  key: { type: String, required: true },
  value: { type: Boolean, required: true },
});

export default mongoose.model<IRuntimeConfig>(
  "RuntimeConfig",
  RuntimeConfigSchema
);
