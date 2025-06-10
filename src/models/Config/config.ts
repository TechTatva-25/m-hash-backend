import mongoose, { Document, Schema } from "mongoose";

export interface IConfig extends Document {
	key: string;
	value: boolean;
}

const ConfigSchema: Schema<IConfig> = new Schema<IConfig>({
	key: { type: String, required: true },
	value: { type: Boolean, required: true },
});

export default mongoose.model<IConfig>("Config", ConfigSchema);
