module.exports = class Logger {

  constructor (status, message) {
    this.status = status;
    this.message = message;
  }

  getStatus = () => this.staus;

  getMessage = () => this.message;

  toString() {
    return `[${this.status}] ${this.message}`;
  }

};
