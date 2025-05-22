const errorController = {}

errorController.throwError = (req, res, next) => {
  throw new Error("Intentional Server Crash - Task 3")
}

module.exports = errorController
