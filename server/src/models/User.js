import mongoose from 'mongoose';
const userSchema = new mongoose.Schema({
 email:{type:String,required:true,unique:true,lowercase:true,trim:true}, passwordHash:{type:String,required:true}, role:{type:String,enum:['student','admin'],default:'student'}, displayName:{type:String,trim:true,maxLength:80,default:'Student'},
 profile:{educationLevel:{type:String,default:'Undergraduate'},discipline:{type:String,default:''},graduationYear:{type:Number,default:null},interests:{type:[String],default:[]},preferredLocation:{type:String,default:''},preferredModes:{type:[String],default:['Online','Hybrid']}},
 preferences:{timeZone:{type:String,default:'Asia/Kolkata'},inAppReminders:{type:Boolean,default:true},reminderLeadDays:{type:[Number],default:[7,3,1]} }
},{timestamps:true});
userSchema.set('toJSON',{transform(_doc,ret){delete ret.passwordHash;delete ret.__v;return ret;}});
export default mongoose.model('User',userSchema);
