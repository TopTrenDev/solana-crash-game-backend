// Import Dependencies
import mongoose from 'mongoose';
const { Schema, SchemaTypes } = mongoose;

// Setup PaymentTx Schema
const PaymentTxSchema = new Schema({
  // Reason for this wallet transaction
  description: String,

  // Amount that was increased or decreased
  amount: Number,

  // Tx hash
  hash: String,

  // Tx blocktime
  blockTime: Date,

  // What user does this belong to
  _user: {
    type: SchemaTypes.ObjectId,
    ref: 'User',
  },

  // When document was inserted
  created: {
    type: Date,
    default: Date.now,
  },
});

// Create and export the new model
const PaymentTx = mongoose.model('PaymentTx', PaymentTxSchema);
export default PaymentTx;
