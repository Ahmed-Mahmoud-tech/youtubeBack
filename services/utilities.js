const toggleLike = async (
  Model,
  field,
  anotherField,
  userId,
  updatedModel,
  value
) => {
  let objectUpdate;
  let conditionObject = { _id: updatedModel, [field]: { $ne: userId } };

  if (value == "add") {
    objectUpdate = {
      $push: { [field]: userId },
      $pull: { [anotherField]: userId },
    };
  } else if (value == "remove") {
    conditionObject = { _id: updatedModel };
    objectUpdate = {
      $pull: { [field]: userId },
    };
  }
  Model.findOneAndUpdate(conditionObject, objectUpdate).exec();
};
module.exports = { toggleLike };
