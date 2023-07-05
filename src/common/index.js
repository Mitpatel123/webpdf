function apiResponse(status, message, data, error) {
  this.status = status;
  this.message = message;
  this.data = data;
  this.error = error;
}

module.exports = apiResponse;
