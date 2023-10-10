"use strict";

let response = {};

const appendExtraParams = (resObject, extraParams = null) => {
  if (extraParams)
    Object.keys(extraParams).map((x) => (resObject[x] = extraParams[x]));
};

response.successResponse = (res, extraParams = null) => {
  const resObject = {
    isSuccess: true,
    status: 200,
  };
  appendExtraParams(resObject, extraParams);
  return res.status(200).json(resObject);
};

response.badRequestResponse = (res, extraParams = null) => {
  const resObject = {
    isSuccess: false,
    status: 400,
  };
  appendExtraParams(resObject, extraParams);
  return res.status(400).json(resObject);
};

response.notFoundResponse = (res, extraParams = null) => {
  const resObject = {
    isSuccess: false,
    statusCode: 404,
  };
  appendExtraParams(resObject, extraParams);
  return res.status(404).json(resObject);
};
response.validarionerrorResponse = (res, extraParams = null) => {
  const resObject = {
    isSuccess: false,
    statusCode: 404,
  };
  appendExtraParams(resObject, extraParams);
  return res.status(404).send(resObject);
};
response.errorResponse = (error, res) => {
  console.log("error", error);
  return res.status(500).json({
    isSuccess: false,
    status: 500,
    message: error.message,
  });
};

module.exports = response;
