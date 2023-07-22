const ObjectId = require("mongodb").ObjectId

const reviews = [
    {
    Comment: "Review. Lorem ipsum dolor sit amet consectetur adipisicing elit. Magni ipsa ducimus architecto explicabo id accusantium nihil exercitationem autem porro esse.",
    rating: 5,
    user: { _id: new ObjectId(), name: "John Doe" },
  },
  {
    Comment: "Review. Lorem ipsum dolor sit amet consectetur adipisicing elit. Magni ipsa ducimus architecto explicabo id accusantium nihil exercitationem autem porro esse.",
    rating: 5,
    user: { _id: new ObjectId(), name: "John Doe" },
  },
  {
    Comment: "Review. Lorem ipsum dolor sit amet consectetur adipisicing elit. Magni ipsa ducimus architecto explicabo id accusantium nihil exercitationem autem porro esse.",
    rating: 5,
    user: { _id: new ObjectId(), name: "John Doe" },
  },
  {
    Comment: "Review. Lorem ipsum dolor sit amet consectetur adipisicing elit. Magni ipsa ducimus architecto explicabo id accusantium nihil exercitationem autem porro esse.",
    rating: 4,
    user: { _id: new ObjectId(), name: "John Doe" },
  },
  {
    Comment: "Review. Lorem ipsum dolor sit amet consectetur adipisicing elit. Magni ipsa ducimus architecto explicabo id accusantium nihil exercitationem autem porro esse.",
    rating: 3,
    user: { _id: new ObjectId(), name: "John Doe" },
  },
]

module.exports = reviews
