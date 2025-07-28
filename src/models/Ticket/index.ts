import mongoose, { Schema, InferSchemaType } from "mongoose";

const TicketSchema = new Schema(
	{
		email: { type: String, required: true },
		message: { type: String, required: true },
		resolved: { type: Boolean, default: false },
	},
	{ timestamps: true },
);

export type ITicket = InferSchemaType<typeof TicketSchema>;

export default mongoose.model("Ticket", TicketSchema);
