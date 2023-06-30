const toggleLikeCore = async (
  Model,
  field,
  anotherField,
  valueId,
  updatedModel,
  value
) => {
  let objectUpdate;
  let conditionObject = { _id: updatedModel, [field]: { $ne: valueId } };

  if (value == "add") {
    objectUpdate = {
      $push: { [field]: valueId },
      $pull: { [anotherField]: valueId },
    };
  } else if (value == "remove") {
    conditionObject = { _id: updatedModel };
    objectUpdate = {
      $pull: { [field]: valueId },
    };
  }

  Model.findOneAndUpdate(conditionObject, objectUpdate).exec();
};

const toggleLike = async (
  VideoModel,
  UserModel,
  field,
  anotherField,
  userId,
  videoId,
  value
) => {
  await toggleLikeCore(VideoModel, field, anotherField, userId, videoId, value);
  await toggleLikeCore(UserModel, field, anotherField, videoId, userId, value);
};

module.exports = { toggleLike };
