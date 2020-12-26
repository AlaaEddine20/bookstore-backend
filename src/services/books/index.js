const express = require("express");
const uniqid = require("uniqid");
const { check, validationResult } = require("express-validator");
const { getBooks, writeBooks } = require("../../fsUtilities");

const booksRouter = express.Router();

const moviesValidation = [
  check("title").exists().withMessage("Movie title is required"),
  check("price").exists().withMessage("Price is required"),
  check("category")
    .exists()
    .withMessage("Category will help users to find your movier easily!"),
];
const commetsValidation = [
  check("UserName").exists().withMessage("UserName required!"),
  check("Text").exists().withMessage("Leave a comment!"),
];

booksRouter.get("/", async (req, res, next) => {
  // get http:localhost:4001/books?category=scifi&title=whatever
  try {
    const books = await getBooks();

    if (req.query && req.query.category) {
      const filteredBooks = books.filter(
        (book) =>
          book.hasOwnProperty("category") &&
          book.category === req.query.category
      );
      res.send(filteredBooks);
    } else {
      res.send(books);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

booksRouter.get("/:asin", async (req, res, next) => {
  try {
    const books = await getBooks();

    const bookFound = books.find((book) => book.asin === req.params.asin);

    if (bookFound) {
      res.send(bookFound);
    } else {
      const err = new Error();
      err.httpStatusCode = 404;
      next(err);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

booksRouter.post("/", async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error();
      error.message = errors;
      error.httpStatusCode = 400;
      next(error);
    } else {
      const books = await getBooks();

      const asinFound = books.find((book) => book.asin === req.body.asin);

      if (asinFound) {
        const error = new Error();
        error.httpStatusCode = 400;
        error.message = "Book already in db";
        next(error);
      } else {
        books.push(req.body);
        await writeBooks(books);
        res.status(201).send({ asin: req.body.asin });
      }
    }
  } catch (error) {
    console.log(error);
    const err = new Error("An error occurred while reading from the file");
    next(err);
  }
});

booksRouter.put("/:asin", moviesValidation, async (req, res, next) => {
  try {
    const validationErrors = validationResult(req);

    const books = await getBooks();

    const bookIndex = books.findIndex((book) => book.asin === req.params.asin);

    if (bookIndex !== -1) {
      // Book found
      const updatedBook = [
        ...books.slice(0, bookIndex),
        { ...books[bookIndex], ...req.body },
        ...books.slice(bookIndex + 1),
      ];
      await writeBooks(updatedBook);
      res.send(updatedBook);
    } else {
      const err = new Error();
      err.httpStatusCode = 404;
      next(err);
    }
  } catch (error) {
    console.log(error);
    const err = new Error("An error occurred while reading from the file");
    next(err);
  }
});

booksRouter.delete("/:asin", async (req, res, next) => {
  try {
    const books = await getBooks();

    const bookFound = books.find((book) => book.asin === req.params.asin);

    if (bookFound) {
      const filteredBooks = books.filter(
        (book) => book.asin !== req.params.asin
      );

      await writeBooks(filteredBooks);
      res.status(204).send();
    } else {
      const error = new Error();
      error.httpStatusCode = 404;
      next(error);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

booksRouter.post(
  "/:asin/comments",
  commetsValidation,
  async (req, res, next) => {
    try {
      const books = await getBooks();
      const bookIndex = books.findIndex(
        (book) => book.asin === req.params.asin
      );

      if (bookIndex !== -1) {
        books[bookIndex].comments = books[bookIndex].comments
          ? books[bookIndex].comments.push({
              ...req.body,
              CommentID: uniqid(),
              Date: new Date(),
            })
          : [{ ...req.body, CommentID: uniqid(), Date: new Date() }];

        await writeBooks(books);
        res.status(201).send(books);
      } else {
        const error = new Error();
        err.httpStatusCode = 404;
        next(error);
      }
    } catch (error) {
      next(error);
    }
  }
);

booksRouter.get("/:asin/comments", async (req, res, next) => {
  const books = await getBooks();
  const bookIndex = books.find((book) => book.asin === req.params.asin);

  if (bookIndex) {
    res.send(bookIndex.comments);
  } else {
    const error = new Error();
    error.httpStatusCode = 404;
    next(err);
  }
});

booksRouter.delete(
  "/:asin/comments/:commentID",
  commetsValidation,
  async (req, res, next) => {
    try {
      const books = await getBooks();
      const bookIndex = books.findIndex(
        (book) => book.asin === req.params.asin
      );

      if (bookIndex !== -1) {
        const filteredComments = books[bookIndex].comments.filter(
          (comment) => comment.CommentID !== req.params.commentID
        );
        books[bookIndex].comments = filteredComments;
        await writeBooks(books);
        res.status(204).send(books);
      } else {
        const error = new Error();
        error.httpStatusCode = 404;
        error.message = "Book not found!";
        next(error);
      }
    } catch (error) {
      next(error);
    }
  }
);

module.exports = booksRouter;
