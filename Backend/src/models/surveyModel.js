import mongoose from "mongoose";

// Schema for Survey
const surveySchema = new mongoose.Schema({
  sr_no: {
    type: Number,
  },
  parcel_id: {
    type: String,
  },
  rd: {
    type: String,
  },
  coordinates: {
    lat: { type: Number },
    lng: { type: Number },
  },
  pkg: {
    type: String,
  },
  village: {
    type: String,
  },
  identification: {
    owner_name: {
      type: String,
    },
    f_name:{
      type: String,
    },
    cnic:{
      type: String,
    },
    khasra_no:{
      type: String,
    },
    phone: {
      type: String,
    },
    land_owner_doc:{
        type:String,
    },
    electricity_connection_name:{
        type:String,
    },
    land_area:{
        type:String,
    }
  },
  status:{
    type:String,
    default:"",
    enum:["residential","commercial","cattle_farm","agricultural","empty_plot","under_construction","agri","deras","other",""],
  },
  stractural_name:{
    type:String,
  },
  covered_area:{
    length:{
        type:String,
    },
    width:{
        type:String,
    },
    area:{
        type:String,
    }
  },
  nature_of_construction:{
    type:String,
    default:"",
   // enum:["pacca","semi_pacca","katcha",""],
  },
  imgOne:{ 
    type:String,
  },
  imgTwo:{
    type:String,
  }
}, { timestamps: true });

surveySchema.index({ sr_no: 1 });
surveySchema.index({ village: 1, status: 1 });
surveySchema.index({ "identification.owner_name": 1 });

// create model for survey

const Survey = mongoose.model("Survey", surveySchema);

export default Survey;