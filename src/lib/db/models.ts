import mongoose, { Schema, model, models } from 'mongoose';

// --- User Model ---
const UserSchema = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'admin' },
}, { timestamps: true });

export const User = models.User || model('User', UserSchema);

// --- Team Model ---
const TeamSchema = new Schema({
    teamId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    college: { type: String, required: true },
    place: { type: String },
    track: { type: String },
    members: { type: String }, // Storing as JSON string to match previous structure, or could be Array
    token: { type: String, unique: true },
    qrCodeUrl: { type: String },
    seatNumber: { type: String },

    // Check-in Status
    gateCheckIn: { type: Boolean, default: false },
    gateCheckInTime: { type: Date },
    presentMembers: { type: [String], default: [] }, // Members present at check-in

    hallCheckIn: { type: Boolean, default: false },
    hallCheckInTime: { type: Date },

}, { timestamps: true });

export const Team = models.Team || model('Team', TeamSchema);

// --- Checkin Log Model ---
const CheckinLogSchema = new Schema({
    teamId: { type: String, required: true },
    checkpoint: { type: String, required: true, enum: ['GATE', 'HALL'] },
    handledBy: { type: String, default: 'Unknown' },
    timestamp: { type: Date, default: Date.now }
});

export const CheckinLog = models.CheckinLog || model('CheckinLog', CheckinLogSchema);
