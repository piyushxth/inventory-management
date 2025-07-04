import mongoose from "mongoose";

// Ensures the models are registered
export const registerModels = () => {
  // mongoose.models.GroupModel ||
  //   (mongoose.model("GroupModel", GroupModel.schema),
  //   console.log("GroupModel model registered successfully."));
  // mongoose.models.Itinenary ||
  //   (mongoose.model("Itinenary", Itinerary.schema),
  //   console.log("Itinenary model registered successfully."));
};

// Export the models to use in other parts of the app
export { mongoose };
// export {Itinenary,GroupModel};
