import mongoose from "mongoose";
import Roles from "./models/roles";

// Ensures the models are registered
export const registerModels = () => {
  mongoose.models.Roles ||
    (mongoose.model("Roles", Roles.schema),
    console.log("Roles model registered successfully."));
};

// Export the models to use in other parts of the app
export { mongoose };
// export {Itinenary,GroupModel};
