import mongoose, { Document, Schema } from "mongoose";

export enum InviteType {
  OUTGOING = "outgoing", // Team leader invited the user
  INCOMING = "incoming", // User requested to join the team
}

export interface IInvite extends Document {
  team: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  type: InviteType;
  createdAt: Date;
  updatedAt: Date;
}

const InviteSchema: Schema<IInvite> = new Schema<IInvite>(
  {
    team: { type: Schema.Types.ObjectId, ref: "Team", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: [InviteType.INCOMING, InviteType.OUTGOING],
      required: true,
    },
  },
  { timestamps: true }
);

InviteSchema.index({ user: 1 });
InviteSchema.index({ team: 1 });
InviteSchema.index({ team: 1, user: 1 }, { unique: true }); // Prevent duplicate invites

const Invite = mongoose.model<IInvite>("Invite", InviteSchema);
export default Invite;
