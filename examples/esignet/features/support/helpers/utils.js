const jsonToBase64 = (jsonObj) => {
  const jsonString = JSON.stringify(jsonObj);
  return Buffer.from(jsonString).toString("base64");
};

module.exports = {
  jsonToBase64,
};
